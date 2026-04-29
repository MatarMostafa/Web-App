import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import {
  getOrderBillingSummary,
  computeOrderBilling,
  listCustomerPricingRules,
  createCustomerPricingRule,
  updateCustomerPricingRule,
  deleteCustomerPricingRule
} from '../controllers/billingController';

const router = Router();

router.use(authMiddleware);

// Order billing endpoints
router.get(
  '/orders/:orderId/summary',
  roleMiddleware(['ADMIN', 'SUPER_ADMIN', 'TEAM_LEADER']),
  getOrderBillingSummary
);

router.post(
  '/orders/:orderId/compute',
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  computeOrderBilling
);

// Customer pricing rule endpoints
router.get(
  '/customers/:customerId/rules',
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  listCustomerPricingRules
);

router.post(
  '/customers/:customerId/rules',
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  createCustomerPricingRule
);

router.put(
  '/customers/:customerId/rules/:ruleId',
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  updateCustomerPricingRule
);

router.delete(
  '/customers/:customerId/rules/:ruleId',
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  deleteCustomerPricingRule
);

export default router;
