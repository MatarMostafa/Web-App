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
  if (customerActivityId) {
    const activityRule = await (prisma as any).customerPricingRule.findFirst({
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

  const defaultRule = await (prisma as any).customerPricingRule.findFirst({
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
 * Returns null if the order has no actualHours or no active rule has an hourlyRate.
 */
export async function computeOrderHourlyBilling(
  orderId: string,
  customerId: string,
  date: Date = new Date()
): Promise<{ lineTotal: Decimal; method: PricingMethod; currency: string; hours: Decimal; rate: Decimal } | null> {
  const rule = await (prisma as any).customerPricingRule.findFirst({
    where: {
      customerId,
      isActive: true,
      effectiveFrom: { lte: date },
      hourlyRate: { not: null },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }]
    },
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

  const existing = await (prisma as any).billingLineItem.findFirst({
    where: { orderId, method: 'HOURLY', assignmentId: null, containerEmployeeId: null }
  });

  if (existing) {
    await (prisma as any).billingLineItem.update({
      where: { id: existing.id },
      data: {
        quantity: hours.toDecimalPlaces(4),
        rate: hourlyRate.toDecimalPlaces(2),
        lineTotal: lineTotal.toDecimalPlaces(2),
        computedAt: new Date()
      }
    });
  } else {
    await (prisma as any).billingLineItem.create({
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
 * Computes billing for a container-employee across all active pricing methods
 * (PER_CARTON, PER_PIECE, PER_ARTICLE) independently.
 *
 * Entity hierarchy:
 *   Container → ContainerArticle[] (product models, e.g. Samsung S25)
 *             → pieces (individual units, reportedPieceQuantity / pieceQuantity)
 *             → cartons (boxes, reportedCartonQuantity / cartonQuantity)
 */
export async function computeBilling(
  options: ComputeBillingOptions
): Promise<{ lineTotal: Decimal; method: PricingMethod; currency: string }[] | null> {
  const { customerId, orderId, customerActivityId, containerEmployeeId, date = new Date() } = options;

  const rule = await resolveActivePricingRule(customerId, customerActivityId, date);
  if (!rule) return null;

  if (!containerEmployeeId) return null;

  const ce = await prisma.containerEmployee.findUnique({
    where: { id: containerEmployeeId },
    include: {
      container: {
        include: { articles: true }
      }
    }
  });
  if (!ce) return null;

  const results: { lineTotal: Decimal; method: PricingMethod; currency: string }[] = [];

  // PER_CARTON
  if (rule.cartonRate) {
    const cartonRate = new Decimal(rule.cartonRate.toString());
    if (cartonRate.gt(0)) {
      const reported = ce.reportedCartonQuantity ?? 0;
      const quantity = new Decimal(reported > 0 ? reported : (ce.container?.cartonQuantity ?? 0));
      const lineTotal = quantity.mul(cartonRate);
      await upsertContainerEmployeeLineItem(customerId, orderId, containerEmployeeId, PricingMethod.PER_CARTON, quantity, cartonRate, lineTotal);
      results.push({ lineTotal, method: PricingMethod.PER_CARTON, currency: 'EUR' });
    }
  }

  // PER_PIECE — individual units (phones); uses reportedPieceQuantity / container.pieceQuantity
  if (rule.pieceRate) {
    const pieceRate = new Decimal(rule.pieceRate.toString());
    if (pieceRate.gt(0)) {
      const reported = (ce as any).reportedPieceQuantity ?? 0;
      const quantity = new Decimal(reported > 0 ? reported : ((ce.container as any)?.pieceQuantity ?? 0));
      const lineTotal = quantity.mul(pieceRate);
      await upsertContainerEmployeeLineItem(customerId, orderId, containerEmployeeId, PricingMethod.PER_PIECE, quantity, pieceRate, lineTotal);
      results.push({ lineTotal, method: PricingMethod.PER_PIECE, currency: 'EUR' });
    }
  }

  // PER_ARTICLE — distinct article types (product models, e.g. Samsung S25, S24, S3)
  if (rule.articleRate) {
    const articleRate = new Decimal(rule.articleRate.toString());
    if (articleRate.gt(0)) {
      const reported = (ce as any).reportedArticleQuantity ?? 0;
      const fallback = (ce.container as any)?.articleQuantity ?? 0;
      const quantity = new Decimal(reported > 0 ? reported : fallback);
      const lineTotal = quantity.mul(articleRate);
      await upsertContainerEmployeeLineItem(customerId, orderId, containerEmployeeId, PricingMethod.PER_ARTICLE, quantity, articleRate, lineTotal);
      results.push({ lineTotal, method: PricingMethod.PER_ARTICLE, currency: 'EUR' });
    }
  }

  return results.length > 0 ? results : null;
}

async function upsertContainerEmployeeLineItem(
  customerId: string,
  orderId: string,
  containerEmployeeId: string,
  method: PricingMethod,
  quantity: Decimal,
  rate: Decimal,
  lineTotal: Decimal
) {
  const existing = await (prisma as any).billingLineItem.findFirst({
    where: { containerEmployeeId, method: method as any }
  });

  if (existing) {
    await (prisma as any).billingLineItem.update({
      where: { id: existing.id },
      data: {
        quantity: quantity.toDecimalPlaces(4),
        rate: rate.toDecimalPlaces(2),
        lineTotal: lineTotal.toDecimalPlaces(2),
        computedAt: new Date()
      }
    });
  } else {
    await (prisma as any).billingLineItem.create({
      data: {
        customerId,
        orderId,
        containerEmployeeId,
        method: method as any,
        quantity: quantity.toDecimalPlaces(4),
        rate: rate.toDecimalPlaces(2),
        lineTotal: lineTotal.toDecimalPlaces(2),
        currency: 'EUR'
      }
    });
  }
}
