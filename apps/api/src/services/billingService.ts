import { Decimal } from 'decimal.js';
import { prisma } from '@repo/db';
import { PricingMethod } from '../types/pricing';

export interface BillingInput {
  customerId: string;
  orderId: string;
  customerActivityId?: string;
  date?: Date;
}

export interface ComputeBillingOptions extends BillingInput {
  assignmentId?: string;
  containerEmployeeId?: string;
}

/**
 * Resolves the active CustomerPricingRule for a customer/activity/date combination.
 *
 * Precedence:
 * 1. Activity-specific rule (customerId + customerActivityId)
 * 2. Customer-level default rule (customerId, customerActivityId = null)
 * 3. null → caller falls back to legacy QUANTITY / CustomerPrice tiers
 */
export async function resolveActivePricingRule(
  customerId: string,
  customerActivityId?: string,
  date: Date = new Date()
) {
  // 1. Activity-specific rule
  if (customerActivityId) {
    const activityRule = await prisma.customerPricingRule.findFirst({
      where: {
        customerId,
        customerActivityId,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }]
      },
      orderBy: { effectiveFrom: 'desc' }
    });
    if (activityRule) return activityRule;
  }

  // 2. Customer-level default rule
  const defaultRule = await prisma.customerPricingRule.findFirst({
    where: {
      customerId,
      customerActivityId: null,
      isActive: true,
      effectiveFrom: { lte: date },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }]
    },
    orderBy: { effectiveFrom: 'desc' }
  });

  return defaultRule ?? null;
}

/**
 * Computes hourly billing for an order using order.actualHours × rule.hourlyRate.
 * Persists a single BillingLineItem per order for the HOURLY method.
 * Returns null if the order has no actualHours or the rule has no hourlyRate.
 */
export async function computeOrderHourlyBilling(
  orderId: string,
  customerId: string,
  date: Date = new Date()
): Promise<{ lineTotal: Decimal; method: PricingMethod; currency: string; hours: Decimal; rate: Decimal } | null> {
  // Find any active HOURLY rule for this customer: activity-specific rules take precedence
  // over customer-level defaults. resolveActivePricingRule(undefined) only finds default
  // (null-activity) rules, so we query directly for HOURLY here.
  const rule = await prisma.customerPricingRule.findFirst({
    where: {
      customerId,
      method: 'HOURLY',
      isActive: true,
      effectiveFrom: { lte: date },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }]
    },
    // Prefer activity-specific rules (non-null customerActivityId) over defaults
    orderBy: [{ customerActivityId: 'asc' }, { effectiveFrom: 'desc' }]
  });
  if (!rule) return null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { actualHours: true }
  });
  if (!order?.actualHours) return null;

  const hours = new Decimal(order.actualHours.toString());
  if (hours.lte(0)) return null;

  const hourlyRate = rule.hourlyRate ? new Decimal(rule.hourlyRate.toString()) : null;
  if (!hourlyRate || hourlyRate.lte(0)) return null;

  const lineTotal = hours.mul(hourlyRate);

  // Upsert: one HOURLY line item per order (no assignmentId / containerEmployeeId)
  const existing = await prisma.billingLineItem.findFirst({
    where: { orderId, method: 'HOURLY', assignmentId: null, containerEmployeeId: null }
  });

  if (existing) {
    await prisma.billingLineItem.update({
      where: { id: existing.id },
      data: {
        quantity: hours.toDecimalPlaces(4),
        rate: hourlyRate.toDecimalPlaces(2),
        lineTotal: lineTotal.toDecimalPlaces(2),
        computedAt: new Date()
      }
    });
  } else {
    await prisma.billingLineItem.create({
      data: {
        customerId,
        orderId,
        method: 'HOURLY' as any,
        quantity: hours.toDecimalPlaces(4),
        rate: hourlyRate.toDecimalPlaces(2),
        lineTotal: lineTotal.toDecimalPlaces(2),
        currency: 'EUR'
      }
    });
  }

  return { lineTotal, method: PricingMethod.HOURLY, currency: 'EUR', hours, rate: hourlyRate };
}

/**
 * Core billing computation for container-employees (PER_CARTON / PER_PIECE).
 * Resolves the applicable pricing rule and upserts a BillingLineItem.
 * Returns null when no applicable rule exists.
 */
export async function computeBilling(
  options: ComputeBillingOptions
): Promise<{ lineTotal: Decimal; method: PricingMethod; currency: string } | null> {
  const { customerId, orderId, customerActivityId, containerEmployeeId, date = new Date() } = options;

  const rule = await resolveActivePricingRule(customerId, customerActivityId, date);
  if (!rule) return null;

  const method = rule.method as PricingMethod;

  let quantity: Decimal;
  let rate: Decimal;

  if (method === PricingMethod.HOURLY) {
    // HOURLY is handled at order level via computeOrderHourlyBilling, not per-assignment
    return null;
  }

  if (method === PricingMethod.PER_CARTON || method === PricingMethod.PER_PIECE) {
    if (!containerEmployeeId) return null;

    const ce = await prisma.containerEmployee.findUnique({
      where: { id: containerEmployeeId },
      include: { container: true }
    });
    if (!ce) return null;

    if (method === PricingMethod.PER_CARTON) {
      const reported = ce.reportedCartonQuantity ?? 0;
      quantity = new Decimal(reported > 0 ? reported : (ce.container?.cartonQuantity ?? 0));
      const cartonRate = rule.cartonRate ? new Decimal(rule.cartonRate.toString()) : null;
      if (!cartonRate || cartonRate.lte(0)) return null;
      rate = cartonRate;
    } else {
      // PER_PIECE
      const reported = ce.reportedArticleQuantity ?? 0;
      quantity = new Decimal(reported > 0 ? reported : (ce.container?.articleQuantity ?? 0));
      const articleRate = rule.articleRate ? new Decimal(rule.articleRate.toString()) : null;
      if (!articleRate || articleRate.lte(0)) return null;
      rate = articleRate;
    }

    const lineTotal = quantity.mul(rate);
    await upsertBillingLineItem({
      customerId,
      orderId,
      assignmentId: undefined,
      containerEmployeeId,
      method,
      quantity,
      rate,
      lineTotal,
      currency: 'EUR'
    });

    return { lineTotal, method, currency: 'EUR' };
  }

  // QUANTITY method: handled by the legacy getPriceForCustomer path
  return null;
}

interface UpsertArgs {
  customerId: string;
  orderId: string;
  assignmentId?: string;
  containerEmployeeId?: string;
  method: PricingMethod;
  quantity: Decimal;
  rate: Decimal;
  lineTotal: Decimal;
  currency: string;
}

async function upsertBillingLineItem(args: UpsertArgs) {
  const { customerId, orderId, assignmentId, containerEmployeeId, method, quantity, rate, lineTotal, currency } = args;

  if (assignmentId) {
    await prisma.billingLineItem.upsert({
      where: { assignmentId },
      update: {
        method: method as any,
        quantity: quantity.toDecimalPlaces(4),
        rate: rate.toDecimalPlaces(2),
        lineTotal: lineTotal.toDecimalPlaces(2),
        currency,
        computedAt: new Date()
      },
      create: {
        customerId,
        orderId,
        assignmentId,
        method: method as any,
        quantity: quantity.toDecimalPlaces(4),
        rate: rate.toDecimalPlaces(2),
        lineTotal: lineTotal.toDecimalPlaces(2),
        currency
      }
    });
  } else if (containerEmployeeId) {
    await prisma.billingLineItem.upsert({
      where: { containerEmployeeId },
      update: {
        method: method as any,
        quantity: quantity.toDecimalPlaces(4),
        rate: rate.toDecimalPlaces(2),
        lineTotal: lineTotal.toDecimalPlaces(2),
        currency,
        computedAt: new Date()
      },
      create: {
        customerId,
        orderId,
        containerEmployeeId,
        method: method as any,
        quantity: quantity.toDecimalPlaces(4),
        rate: rate.toDecimalPlaces(2),
        lineTotal: lineTotal.toDecimalPlaces(2),
        currency
      }
    });
  }
}
