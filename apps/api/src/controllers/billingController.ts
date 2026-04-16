import { Request, Response } from 'express';
import { prisma } from '@repo/db';
import { Decimal } from 'decimal.js';
import { PricingMethod } from '../types/pricing';
import { computeBilling, computeOrderHourlyBilling } from '../services/billingService';
import { getCustomerPricingRules } from '../services/priceService';

// ==============================
// Order Billing
// ==============================

/**
 * GET /billing/orders/:orderId/summary
 * Returns all BillingLineItems for an order with totals by method and grand total.
 */
export const getOrderBillingSummary = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, customerId: true, actualHours: true }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Auto-compute and persist hourly billing whenever actualHours exists and a rule applies
    if (order.actualHours) {
      await computeOrderHourlyBilling(orderId, order.customerId).catch(() => {});
    }

    const lineItems = await prisma.billingLineItem.findMany({
      where: { orderId },
      include: {
        assignment: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        containerEmployee: {
          select: { id: true, employeeId: true, containerId: true }
        }
      },
      orderBy: { computedAt: 'desc' }
    });

    const totalByMethod: Record<string, number> = {
      [PricingMethod.HOURLY]: 0,
      [PricingMethod.PER_CARTON]: 0,
      [PricingMethod.PER_PIECE]: 0,
      [PricingMethod.QUANTITY]: 0
    };

    let grandTotal = new Decimal(0);
    let currency = 'EUR';

    for (const item of lineItems) {
      const lt = new Decimal(item.lineTotal.toString());
      totalByMethod[item.method] = new Decimal(totalByMethod[item.method] ?? 0).add(lt).toNumber();
      grandTotal = grandTotal.add(lt);
      currency = item.currency;
    }

    // Include order-level context for display
    const hourlyLineItem = lineItems.find(
      (i) => i.method === PricingMethod.HOURLY && !i.assignmentId && !i.containerEmployeeId
    );

    res.json({
      orderId,
      actualHours: order.actualHours ? Number(order.actualHours) : null,
      hourlyRate: hourlyLineItem ? Number(hourlyLineItem.rate) : null,
      lineItems,
      totalByMethod,
      grandTotal: grandTotal.toNumber(),
      currency
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /billing/orders/:orderId/compute
 * Recomputes billing for all completed assignments and container-employees on the order.
 * Idempotent — safe to call multiple times.
 */
export const computeOrderBilling = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, customerId: true }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const results: { type: string; id: string; result: string }[] = [];

    // HOURLY: computed at order level using order.actualHours × rule.hourlyRate
    try {
      const hourly = await computeOrderHourlyBilling(orderId, order.customerId);
      results.push({
        type: 'order',
        id: orderId,
        result: hourly
          ? `HOURLY: ${hourly.hours} hrs × €${hourly.rate} = €${hourly.lineTotal}`
          : 'skipped (no HOURLY rule or no actualHours on order)'
      });
    } catch (err: any) {
      results.push({ type: 'order', id: orderId, result: `error: ${err.message}` });
    }

    // Compute billing for completed container-employees (PER_CARTON / PER_PIECE)
    const containers = await prisma.container.findMany({
      where: { orderId },
      include: { employeeAssignments: { where: { isCompleted: true } } }
    });

    for (const container of containers) {
      for (const ce of container.employeeAssignments) {
        try {
          const result = await computeBilling({
            customerId: order.customerId,
            orderId,
            containerEmployeeId: ce.id
          });
          results.push({
            type: 'containerEmployee',
            id: ce.id,
            result: result ? `${result.method}: ${result.lineTotal} ${result.currency}` : 'skipped (no applicable rule)'
          });
        } catch (err: any) {
          results.push({ type: 'containerEmployee', id: ce.id, result: `error: ${err.message}` });
        }
      }
    }

    res.json({ orderId, computed: results.length, details: results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// Customer Pricing Rules
// ==============================

/**
 * GET /billing/customers/:customerId/rules
 */
export const listCustomerPricingRules = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const rules = await getCustomerPricingRules(customerId);
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /billing/customers/:customerId/rules
 */
export const createCustomerPricingRule = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { customerActivityId, method, hourlyRate, cartonRate, articleRate, effectiveFrom, effectiveTo } = req.body;

    if (!method || !effectiveFrom) {
      return res.status(400).json({ error: 'method and effectiveFrom are required' });
    }

    const validMethods = Object.values(PricingMethod);
    if (!validMethods.includes(method)) {
      return res.status(400).json({ error: `method must be one of: ${validMethods.join(', ')}` });
    }

    // Validate that the required rate is provided for the chosen method
    if (method === PricingMethod.HOURLY && !hourlyRate) {
      return res.status(400).json({ error: 'hourlyRate is required for HOURLY method' });
    }
    if (method === PricingMethod.PER_CARTON && !cartonRate) {
      return res.status(400).json({ error: 'cartonRate is required for PER_CARTON method' });
    }
    if (method === PricingMethod.PER_PIECE && !articleRate) {
      return res.status(400).json({ error: 'articleRate is required for PER_PIECE method' });
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Verify activity exists if provided
    if (customerActivityId) {
      const activity = await prisma.customerActivity.findFirst({
        where: { id: customerActivityId, customerId, orderId: null }
      });
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found for this customer' });
      }
    }

    const rule = await prisma.customerPricingRule.create({
      data: {
        customerId,
        customerActivityId: customerActivityId ?? null,
        method,
        hourlyRate: hourlyRate ? new Decimal(hourlyRate) : null,
        cartonRate: cartonRate ? new Decimal(cartonRate) : null,
        articleRate: articleRate ? new Decimal(articleRate) : null,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isActive: true
      },
      include: { customerActivity: { select: { id: true, name: true, type: true } } }
    });

    res.status(201).json({ success: true, data: rule });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A pricing rule with this customer, activity, and effectiveFrom already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /billing/customers/:customerId/rules/:ruleId
 */
export const updateCustomerPricingRule = async (req: Request, res: Response) => {
  try {
    const { customerId, ruleId } = req.params;
    const { hourlyRate, cartonRate, articleRate, effectiveTo, isActive } = req.body;

    const existing = await prisma.customerPricingRule.findFirst({
      where: { id: ruleId, customerId }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }

    const updated = await prisma.customerPricingRule.update({
      where: { id: ruleId },
      data: {
        hourlyRate: hourlyRate !== undefined ? new Decimal(hourlyRate) : undefined,
        cartonRate: cartonRate !== undefined ? new Decimal(cartonRate) : undefined,
        articleRate: articleRate !== undefined ? new Decimal(articleRate) : undefined,
        effectiveTo: effectiveTo !== undefined ? (effectiveTo ? new Date(effectiveTo) : null) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      },
      include: { customerActivity: { select: { id: true, name: true, type: true } } }
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /billing/customers/:customerId/rules/:ruleId
 * Soft-deletes by setting isActive=false.
 */
export const deleteCustomerPricingRule = async (req: Request, res: Response) => {
  try {
    const { customerId, ruleId } = req.params;

    const existing = await prisma.customerPricingRule.findFirst({
      where: { id: ruleId, customerId }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }

    await prisma.customerPricingRule.update({
      where: { id: ruleId },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'Pricing rule deactivated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
