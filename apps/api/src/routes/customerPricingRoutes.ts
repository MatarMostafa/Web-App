import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import {
  getCustomerPrices,
  createCustomerPrice,
  updateCustomerPrice,
  deleteCustomerPrice,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getCustomerActivities,
  createCustomerActivity
} from '../controllers/customerPricingController';

const router = Router();

router.use(authMiddleware);

router.get('/activities', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), getActivities);
router.post('/activities', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), createActivity);
router.put('/activities/:id', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), updateActivity);
router.delete('/activities/:id', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), deleteActivity);
router.post('/customer-activities', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), createCustomerActivity);

router.get('/customers/:id/prices', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), getCustomerPrices);
router.post('/customers/:id/prices', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), createCustomerPrice);
router.put('/customers/:id/prices/:priceId', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), updateCustomerPrice);
router.delete('/customers/:id/prices/:priceId', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), deleteCustomerPrice);

router.get('/customers/:id/activities', roleMiddleware(['ADMIN', 'SUPER_ADMIN', 'TEAM_LEADER']), getCustomerActivities);

// Customer-facing route to get their own activities
router.get('/customers/me/activities', roleMiddleware(['CUSTOMER', 'CUSTOMER_SUB_USER']), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get customer ID from user (works for both CUSTOMER and CUSTOMER_SUB_USER)
    const { prisma } = await import("@repo/db");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        customer: true,
        subAccount: {
          include: { customer: true }
        }
      },
    });

    let customerId: string;
    if (user?.customer) {
      // Direct customer
      customerId = user.customer.id;
    } else if (user?.subAccount?.customer) {
      // Sub-user accessing parent customer's data
      customerId = user.subAccount.customer.id;
    } else {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    // Get customer activities with pricing
    const customerActivities = await prisma.customerActivity.findMany({
      where: { 
        customerId,
        orderId: null, // Only get general activities, not order-specific ones
        isActive: true
      },
      include: {
        activity: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            unit: true,

          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // If no customer-specific activities, get default activities with customer pricing
    if (customerActivities.length === 0) {
      const activities = await prisma.activity.findMany({
        where: { isActive: true },
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
            orderBy: { effectiveFrom: 'desc' },
            take: 1
          }
        }
      });

      const activitiesWithPricing = activities.map(activity => ({
        id: `default-${activity.id}`,
        activity: {
          id: activity.id,
          name: activity.name,
          code: activity.code,
          description: activity.description,
          unit: activity.unit,
          defaultPrice: 50.00
        },
        unitPrice: activity.customerPrices[0]?.price || 50.00,
        quantity: 1,
        isActive: true
      }));

      return res.json({ success: true, data: activitiesWithPricing });
    }

    res.json({ success: true, data: customerActivities });
  } catch (error) {
    console.error("Get customer activities error:", error);
    res.status(500).json({
      message: "Failed to fetch activities",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
