import { Request, Response } from 'express';
import { prisma } from '@repo/db';
import { getPriceForCustomer, validatePriceTierOverlap } from '../services/priceService';
import { Decimal } from 'decimal.js';
import { ActivityType } from '../types/pricing';

export const getCustomerPrices = async (req: Request, res: Response) => {
  try {
    const { id: customerId } = req.params;
    const { activityId: customerActivityId } = req.query;

    const whereClause: any = { customerId };
    if (customerActivityId) {
      whereClause.customerActivityId = customerActivityId as string;
    }

    const prices = await prisma.customerPrice.findMany({
      where: whereClause,
      include: { customerActivity: true },
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
      include: {
        prices: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCustomerPrice = async (req: Request, res: Response) => {
  try {
    const { id: customerId } = req.params;
    const { activityId: customerActivityId, minQuantity, maxQuantity, price, currency = 'EUR', effectiveFrom, effectiveTo, isActive = true } = req.body;

    if (!customerActivityId || !minQuantity || !maxQuantity || !price || !effectiveFrom) {
      return res.status(400).json({ error: 'customerActivityId, minQuantity, maxQuantity, price, and effectiveFrom are required' });
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
      customerActivityId,
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
        customerActivityId,
        minQuantity,
        maxQuantity,
        price: new Decimal(price),
        currency,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isActive
      },
      include: { customerActivity: true }
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
        existing.customerActivityId,
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
      include: { customerActivity: true }
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
    // This was the global activity list. Now activities are per customer.
    // If this endpoint is used without customer context, what should it return?
    // Maybe nothing, or we should require customerId in query?
    // For now, let's look for customerId in query
    const { customerId } = req.query;

    if (!customerId) {
      // Return empty or error? Returning empty to avoid exposing all customers' data
      return res.json([]);
    }

    const activities = await prisma.customerActivity.findMany({
      where: {
        customerId: customerId as string,
        orderId: null,
        isActive: true
      },
      // Include prices?
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

    const activity = await prisma.customerActivity.update({
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

    // Use soft delete or hard delete? Activity used to use soft delete? No, schema said optional isActive but default true.
    // If it's a customer activity definition, we can delete?
    await prisma.customerActivity.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createActivity = async (req: Request, res: Response) => {
  try {
    const { name, type, code, description, unit = 'hour', customerId, basePrice } = req.body;

    // customerId is now required to create a definition
    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required to create an activity definition' });
    }

    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }

    if (!Object.values(ActivityType).includes(type)) {
      return res.status(400).json({ error: 'Invalid activity type' });
    }

    // Check if activity with same name already exists FOR THIS CUSTOMER
    // Since we don't have unique constraint on name+customerId+orderId=null in schema (only index), we check manually.
    const existingActivity = await prisma.customerActivity.findFirst({
      where: {
        customerId,
        name,
        orderId: null
      }
    });

    if (existingActivity) {
      return res.status(409).json({ error: `Activity with name '${name}' already exists for this customer` });
    }

    const activity = await prisma.customerActivity.create({
      data: {
        customerId,
        orderId: null, // Definition
        name,
        type,
        code: code || null,
        description: description || null,
        unit,
        basePrice: (type === 'CONTAINER_LOADING' || type === 'CONTAINER_UNLOADING') && basePrice ? new Decimal(basePrice) : new Decimal(0),
        isActive: true
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
    const { customerId, customerActivityId, quantity, unitPrice, orderId, basePrice } = req.body;

    if (!customerId || !customerActivityId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'customerId, customerActivityId, quantity, and unitPrice are required' });
    }

    // Fetch definition to copy fields
    const definition = await prisma.customerActivity.findUnique({
      where: { id: customerActivityId }
    });
    if (!definition) throw new Error("Definition not found");

    // ... validation logic ..

    // ... new instance ...
    const customerActivity = await prisma.customerActivity.create({
      data: {
        customerId,
        // No explicit relation to definition?
        orderId: orderId || null,
        quantity,
        unitPrice: new Decimal(unitPrice),
        lineTotal: new Decimal(unitPrice).mul(quantity),
        basePrice: basePrice ? new Decimal(basePrice) : new Decimal(0),
        isActive: true,
        // Copy fields
        name: definition.name,
        type: definition.type,
        code: definition.code,
        description: definition.description,
        unit: definition.unit
      },
      // include: { activity: true } // Removed
    });

    res.status(201).json(customerActivity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const calculatePrice = async (req: Request, res: Response) => {
  try {
    const { customerId, activityId: customerActivityId, quantity } = req.body;

    if (!customerId || !customerActivityId || !quantity) {
      return res.status(400).json({ error: 'customerId, customerActivityId, and quantity are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }

    const priceResult = await getPriceForCustomer(customerId, customerActivityId, quantity);
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
