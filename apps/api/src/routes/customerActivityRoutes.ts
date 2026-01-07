import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { prisma } from "@repo/db";

const router = express.Router();

// Get activities available for a specific customer (Admin only)
router.get(
  "/:customerId/activities",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  async (req, res) => {
    try {
      const { customerId } = req.params;

      // Verify customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Get activities that have pricing configured for this customer
      const activitiesWithPricing = await prisma.activity.findMany({
        where: {
          isActive: true,
          customerPrices: {
            some: {
              customerId,
              isActive: true,
              effectiveFrom: { lte: new Date() },
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: new Date() } }
              ]
            }
          }
        },
        include: {
          customerPrices: {
            where: {
              customerId,
              isActive: true,
              effectiveFrom: { lte: new Date() },
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: new Date() } }
              ]
            },
            orderBy: { minQuantity: 'asc' }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json({ success: true, data: activitiesWithPricing });
    } catch (error) {
      console.error("Get customer activities error:", error);
      res.status(500).json({
        message: "Failed to fetch customer activities",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Add activity pricing for a customer (Admin only)
router.post(
  "/:customerId/activities/:activityId/pricing",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  async (req, res) => {
    try {
      const { customerId, activityId } = req.params;
      const { minQuantity, maxQuantity, price, currency = "EUR", effectiveFrom, effectiveTo } = req.body;

      // Verify customer and activity exist
      const [customer, activity] = await Promise.all([
        prisma.customer.findUnique({ where: { id: customerId } }),
        prisma.activity.findUnique({ where: { id: activityId } })
      ]);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }

      // Create customer pricing
      const customerPrice = await prisma.customerPrice.create({
        data: {
          customerId,
          activityId,
          minQuantity: parseInt(minQuantity),
          maxQuantity: parseInt(maxQuantity),
          price: parseFloat(price),
          currency,
          effectiveFrom: new Date(effectiveFrom),
          effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
          isActive: true
        }
      });

      res.status(201).json({ success: true, data: customerPrice });
    } catch (error) {
      console.error("Create customer activity pricing error:", error);
      res.status(500).json({
        message: "Failed to create customer activity pricing",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Remove activity pricing for a customer (Admin only)
router.delete(
  "/:customerId/activities/:activityId/pricing/:priceId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  async (req, res) => {
    try {
      const { customerId, activityId, priceId } = req.params;

      // Verify the pricing belongs to the customer and activity
      const customerPrice = await prisma.customerPrice.findFirst({
        where: {
          id: priceId,
          customerId,
          activityId
        }
      });

      if (!customerPrice) {
        return res.status(404).json({ message: "Customer activity pricing not found" });
      }

      // Soft delete by setting isActive to false
      await prisma.customerPrice.update({
        where: { id: priceId },
        data: { isActive: false }
      });

      res.json({ success: true, message: "Customer activity pricing removed" });
    } catch (error) {
      console.error("Remove customer activity pricing error:", error);
      res.status(500).json({
        message: "Failed to remove customer activity pricing",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get customer activity usage statistics (Admin only)
router.get(
  "/:customerId/activities/statistics",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const { startDate, endDate } = req.query;

      // Verify customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      } : {};

      // Get customer activity usage statistics
      const activityStats = await prisma.customerActivity.groupBy({
        by: ['activityId'],
        where: {
          customerId,
          isActive: true,
          ...dateFilter
        },
        _sum: {
          quantity: true,
          lineTotal: true
        },
        _count: {
          id: true
        }
      });

      // Get activity details
      const activityIds = activityStats.map(stat => stat.activityId);
      const activities = await prisma.activity.findMany({
        where: { id: { in: activityIds } },
        select: { id: true, name: true, code: true, unit: true }
      });

      // Combine stats with activity details
      const enrichedStats = activityStats.map(stat => {
        const activity = activities.find(a => a.id === stat.activityId);
        return {
          activity,
          totalQuantity: stat._sum.quantity || 0,
          totalValue: stat._sum.lineTotal || 0,
          orderCount: stat._count.id
        };
      });

      res.json({ success: true, data: enrichedStats });
    } catch (error) {
      console.error("Get customer activity statistics error:", error);
      res.status(500).json({
        message: "Failed to fetch customer activity statistics",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

export default router;