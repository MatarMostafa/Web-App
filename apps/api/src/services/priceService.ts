import { Decimal } from 'decimal.js';
import { prisma } from '@repo/db';

export interface PriceResult {
  price: Decimal;
  currency: string;
  activityId: string;
  unit: string;
  tier: {
    minQuantity: number;
    maxQuantity: number;
  };
}

export async function getPriceForCustomer(
  customerId: string,
  activityId: string,
  quantity: number,
  date: Date = new Date()
): Promise<PriceResult> {
  if (!quantity || quantity <= 0) {
    throw new Error('Quantity is required and must be positive');
  }

  const customerPrice = await prisma.customerPrice.findFirst({
    where: {
      customerId,
      activityId,
      isActive: true,
      minQuantity: { lte: quantity },
      maxQuantity: { gte: quantity },
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
      activityId,
      unit: customerPrice.activity.unit,
      tier: {
        minQuantity: customerPrice.minQuantity,
        maxQuantity: customerPrice.maxQuantity
      }
    };
  }

  // Fallback: Create a default pricing tier if none exists
  const activity = await prisma.activity.findUnique({
    where: { id: activityId }
  });

  if (!activity) {
    throw new Error(`Activity ${activityId} not found`);
  }

  // Create a default pricing tier for this customer and activity
  const defaultPrice = await prisma.customerPrice.create({
    data: {
      customerId,
      activityId,
      minQuantity: 1,
      maxQuantity: 999999,
      price: 25.00, // Default price
      currency: 'EUR',
      effectiveFrom: new Date(),
      isActive: true
    },
    include: { activity: true }
  });

  return {
    price: new Decimal(defaultPrice.price.toString()),
    currency: defaultPrice.currency,
    activityId,
    unit: defaultPrice.activity.unit,
    tier: {
      minQuantity: defaultPrice.minQuantity,
      maxQuantity: defaultPrice.maxQuantity
    }
  };
}

export async function validatePriceTierOverlap(
  customerId: string,
  activityId: string,
  minQuantity: number,
  maxQuantity: number,
  effectiveFrom: Date,
  effectiveTo: Date | null,
  excludePriceId?: string
): Promise<boolean> {
  if (minQuantity > maxQuantity) {
    throw new Error('Minimum quantity cannot be greater than maximum quantity');
  }

  const overlapping = await prisma.customerPrice.findFirst({
    where: {
      customerId,
      activityId,
      id: excludePriceId ? { not: excludePriceId } : undefined,
      isActive: true,
      AND: [
        {
          OR: [
            {
              minQuantity: { lte: maxQuantity },
              maxQuantity: { gte: minQuantity }
            }
          ]
        },
        {
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
      ]
    }
  });

  return !overlapping;
}
