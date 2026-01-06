import { Request, Response } from 'express';
import { prisma } from '@repo/db';
import { getPriceForCustomer, validatePriceTierOverlap } from '../services/priceService';
import { Decimal } from 'decimal.js';
import { ActivityType } from '../types/pricing';

export const getCustomerPrices = async (req: Request, res: Response) => {
  try {
    const { id: customerId } = req.params;
    const { activityId } = req.query;

    const whereClause: any = { customerId };
    if (activityId) {
      whereClause.activityId = activityId as string;
    }

    const prices = await prisma.customerPrice.findMany({
      where: whereClause,
      include: { activity: true },
      orderBy: [{ effectiveFrom: 'desc' }, { minQuantity: 'asc' }]
    });

    res.json(prices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerActivities = async (req: Request, res: Response) => {
  try {
    const { id: customerId } = req.params;

    const activities = await prisma.customerActivity.findMany({
      where: { 
        customerId,
        isActive: true,
        orderId: null
      },
      include: { activity: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCustomerPrice = async (req: Request, res: Response) => {
  try {
    const { id: customerId } = req.params;
    const { activityId, minQuantity, maxQuantity, price, currency = 'EUR', effectiveFrom, effectiveTo, isActive = true } = req.body;

    if (!activityId || !minQuantity || !maxQuantity || !price || !effectiveFrom) {
      return res.status(400).json({ error: 'activityId, minQuantity, maxQuantity, price, and effectiveFrom are required' });
    }

    if (minQuantity <= 0 || maxQuantity <= 0) {
      return res.status(400).json({ error: 'Quantities must be positive' });
    }

    if (minQuantity > maxQuantity) {
      return res.status(400).json({ error: 'Minimum quantity cannot be greater than maximum quantity' });
    }

    if (new Decimal(price).lte(0)) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    const isValid = await validatePriceTierOverlap(
      customerId,
      activityId,
      minQuantity,
      maxQuantity,
      new Date(effectiveFrom),
      effectiveTo ? new Date(effectiveTo) : null
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Price tier overlaps with existing tier' });
    }

    const customerPrice = await prisma.customerPrice.create({
      data: {
        customerId,
        activityId,
        minQuantity,
        maxQuantity,
        price: new Decimal(price),
        currency,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isActive
      },
      include: { activity: true }
    });

    res.status(201).json(customerPrice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCustomerPrice = async (req: Request, res: Response) => {
  try {
    const { id: customerId, priceId } = req.params;
    const { minQuantity, maxQuantity, price, currency, effectiveFrom, effectiveTo, isActive } = req.body;

    const existing = await prisma.customerPrice.findUnique({
      where: { id: priceId }
    });

    if (!existing || existing.customerId !== customerId) {
      return res.status(404).json({ error: 'Price not found' });
    }

    const newMinQuantity = minQuantity ?? existing.minQuantity;
    const newMaxQuantity = maxQuantity ?? existing.maxQuantity;

    if (newMinQuantity > newMaxQuantity) {
      return res.status(400).json({ error: 'Minimum quantity cannot be greater than maximum quantity' });
    }

    if (price && new Decimal(price).lte(0)) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    if (minQuantity || maxQuantity || effectiveFrom || effectiveTo) {
      const isValid = await validatePriceTierOverlap(
        customerId,
        existing.activityId,
        newMinQuantity,
        newMaxQuantity,
        effectiveFrom ? new Date(effectiveFrom) : existing.effectiveFrom,
        effectiveTo ? new Date(effectiveTo) : existing.effectiveTo,
        priceId
      );

      if (!isValid) {
        return res.status(400).json({ error: 'Price tier overlaps with existing tier' });
      }
    }

    const updated = await prisma.customerPrice.update({
      where: { id: priceId },
      data: {
        ...(minQuantity && { minQuantity }),
        ...(maxQuantity && { maxQuantity }),
        ...(price && { price: new Decimal(price) }),
        ...(currency && { currency }),
        ...(effectiveFrom && { effectiveFrom: new Date(effectiveFrom) }),
        ...(effectiveTo !== undefined && { effectiveTo: effectiveTo ? new Date(effectiveTo) : null }),
        ...(isActive !== undefined && { isActive })
      },
      include: { activity: true }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCustomerPrice = async (req: Request, res: Response) => {
  try {
    const { id: customerId, priceId } = req.params;

    const existing = await prisma.customerPrice.findUnique({
      where: { id: priceId }
    });

    if (!existing || existing.customerId !== customerId) {
      return res.status(404).json({ error: 'Price not found' });
    }

    await prisma.customerPrice.delete({
      where: { id: priceId }
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { isActive: true },
      include: {
        customerActivities: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, code, description, unit } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }

    if (!Object.values(ActivityType).includes(type)) {
      return res.status(400).json({ error: 'Invalid activity type' });
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        name,
        type,
        code,
        description,
        unit
      }
    });

    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.activity.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createActivity = async (req: Request, res: Response) => {
  try {
    const { name, type, code, description, unit = 'hour' } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }

    if (!Object.values(ActivityType).includes(type)) {
      return res.status(400).json({ error: 'Invalid activity type' });
    }

    // Check if activity with same name already exists
    const existingActivity = await prisma.activity.findFirst({
      where: { name }
    });

    if (existingActivity) {
      return res.status(409).json({ error: `Activity with name '${name}' already exists` });
    }

    const activity = await prisma.activity.create({
      data: {
        name,
        type,
        code: code || null,
        description: description || null,
        unit
      }
    });

    res.status(201).json(activity);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Activity with this name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const createCustomerActivity = async (req: Request, res: Response) => {
  try {
    const { customerId, activityId, quantity, unitPrice, orderId } = req.body;

    if (!customerId || !activityId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'customerId, activityId, quantity, and unitPrice are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }

    if (new Decimal(unitPrice).lte(0)) {
      return res.status(400).json({ error: 'Unit price must be greater than 0' });
    }

    const lineTotal = new Decimal(unitPrice).mul(quantity);

    const customerActivity = await prisma.customerActivity.create({
      data: {
        customerId,
        activityId,
        orderId: orderId || null,
        quantity,
        unitPrice: new Decimal(unitPrice),
        lineTotal
      },
      include: { activity: true }
    });

    res.status(201).json(customerActivity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const calculatePrice = async (req: Request, res: Response) => {
  try {
    const { customerId, activityId, quantity } = req.body;

    if (!customerId || !activityId || !quantity) {
      return res.status(400).json({ error: 'customerId, activityId, and quantity are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }

    const priceResult = await getPriceForCustomer(customerId, activityId, quantity);
    const lineTotal = priceResult.price.mul(quantity);

    res.json({
      unitPrice: priceResult.price,
      currency: priceResult.currency,
      quantity,
      lineTotal,
      unit: priceResult.unit,
      tier: priceResult.tier
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
