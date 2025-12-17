import { Decimal } from 'decimal.js';
import { prisma } from '@repo/db';

export interface PriceResult {
  price: Decimal;
  currency: string;
  source: 'customer' | 'default';
  activityId: string;
  unit: string;
}

export async function getPriceForCustomer(
  customerId: string,
  activityId: string,
  date: Date = new Date()
): Promise<PriceResult> {
  const customerPrice = await prisma.customerPrice.findFirst({
    where: {
      customerId,
      activityId,
      isActive: true,
      effectiveFrom: { lte: date },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: date } }
      ]
    },
    orderBy: { effectiveFrom: 'desc' },
    include: { activity: true }
  });

  if (customerPrice) {
    return {
      price: new Decimal(customerPrice.price.toString()),
      currency: customerPrice.currency,
      source: 'customer',
      activityId,
      unit: customerPrice.activity.unit
    };
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId }
  });

  if (!activity) {
    throw new Error(`Activity ${activityId} not found`);
  }

  if (!activity.defaultPrice) {
    throw new Error(`No price available for activity ${activityId}`);
  }

  return {
    price: new Decimal(activity.defaultPrice.toString()),
    currency: 'EUR',
    source: 'default',
    activityId,
    unit: activity.unit
  };
}

export async function validatePriceOverlap(
  customerId: string,
  activityId: string,
  effectiveFrom: Date,
  effectiveTo: Date | null,
  excludePriceId?: string
): Promise<boolean> {
  const overlapping = await prisma.customerPrice.findFirst({
    where: {
      customerId,
      activityId,
      id: excludePriceId ? { not: excludePriceId } : undefined,
      isActive: true,
      OR: [
        {
          effectiveFrom: { lte: effectiveFrom },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: effectiveFrom } }
          ]
        },
        effectiveTo ? {
          effectiveFrom: { lte: effectiveTo },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: effectiveTo } }
          ]
        } : {}
      ]
    }
  });

  return !overlapping;
}
