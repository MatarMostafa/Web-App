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
      customerId = user.customer.id;
    } else if (user?.subAccount?.customer) {
      customerId = user.subAccount.customer.id;
    } else {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    // Get ONLY customer-specific activities (no shared activities)
    const customerActivities = await prisma.customerActivity.findMany({
      where: { 
        customerId,
        orderId: null,
        isActive: true
      },
      include: {
        activity: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            unit: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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
