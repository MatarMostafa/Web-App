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

export default router;
