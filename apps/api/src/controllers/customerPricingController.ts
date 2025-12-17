import { Request, Response } from 'express';
import { prisma } from '@repo/db';
import { getPriceForCustomer, validatePriceOverlap } from '../services/priceService';
import { Decimal } from 'decimal.js';

export const getCustomerPrices = async (req: Request, res: Response) => {
  try {
    const { id: customerId } = req.params;

    const prices = await prisma.customerPrice.findMany({
      where: { customerId },
      include: { activity: true },
      orderBy: { effectiveFrom: 'desc' }
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
        orderId: null // Only get unassigned activities
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
    const { activityId, price, currency = 'EUR', effectiveFrom, effectiveTo, isActive = true } = req.body;

    if (!activityId || !price || !effectiveFrom) {
      return res.status(400).json({ error: 'activityId, price, and effectiveFrom are required' });
    }

    if (new Decimal(price).lte(0)) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    const isValid = await validatePriceOverlap(
      customerId,
      activityId,
      new Date(effectiveFrom),
      effectiveTo ? new Date(effectiveTo) : null
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Price overlaps with existing price range' });
    }

    const customerPrice = await prisma.customerPrice.create({
      data: {
        customerId,
        activityId,
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
    const { price, currency, effectiveFrom, effectiveTo, isActive } = req.body;

    const existing = await prisma.customerPrice.findUnique({
      where: { id: priceId }
    });

    if (!existing || existing.customerId !== customerId) {
      return res.status(404).json({ error: 'Price not found' });
    }

    if (price && new Decimal(price).lte(0)) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    if (effectiveFrom || effectiveTo) {
      const isValid = await validatePriceOverlap(
        customerId,
        existing.activityId,
        effectiveFrom ? new Date(effectiveFrom) : existing.effectiveFrom,
        effectiveTo ? new Date(effectiveTo) : existing.effectiveTo,
        priceId
      );

      if (!isValid) {
        return res.status(400).json({ error: 'Price overlaps with existing price range' });
      }
    }

    const updated = await prisma.customerPrice.update({
      where: { id: priceId },
      data: {
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
    const { name, code, description, defaultPrice, unit } = req.body;

    if (!name || !defaultPrice) {
      return res.status(400).json({ error: 'name and defaultPrice are required' });
    }

    if (new Decimal(defaultPrice).lte(0)) {
      return res.status(400).json({ error: 'defaultPrice must be greater than 0' });
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        name,
        code,
        description,
        defaultPrice: new Decimal(defaultPrice),
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
    const { name, code, description, defaultPrice, unit = 'hour' } = req.body;

    if (!name || !defaultPrice) {
      return res.status(400).json({ error: 'name and defaultPrice are required' });
    }

    if (new Decimal(defaultPrice).lte(0)) {
      return res.status(400).json({ error: 'defaultPrice must be greater than 0' });
    }

    const activity = await prisma.activity.create({
      data: {
        name,
        code,
        description,
        defaultPrice: new Decimal(defaultPrice),
        unit
      }
    });

    res.status(201).json(activity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCustomerActivity = async (req: Request, res: Response) => {
  try {
    const { customerId, name, code, defaultPrice, unit = 'hour' } = req.body;

    if (!customerId || !name || !defaultPrice) {
      return res.status(400).json({ error: 'customerId, name and defaultPrice are required' });
    }

    if (new Decimal(defaultPrice).lte(0)) {
      return res.status(400).json({ error: 'defaultPrice must be greater than 0' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the activity first
      const activity = await tx.activity.create({
        data: {
          name,
          code,
          defaultPrice: new Decimal(defaultPrice),
          unit
        }
      });

      // Create the customer activity relationship
      const customerActivity = await tx.customerActivity.create({
        data: {
          customerId,
          activityId: activity.id,
          unitPrice: new Decimal(defaultPrice)
        },
        include: {
          activity: true,
          customer: true
        }
      });

      return customerActivity;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
