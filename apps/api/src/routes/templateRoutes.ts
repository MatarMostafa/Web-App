import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import * as templateController from "../controllers/templateController";

const router = express.Router();

// Customer Template Routes (Admin only)
router.post(
  "/customers/:customerId/description-template",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  templateController.createCustomerTemplate
);

router.get(
  "/customers/:customerId/description-template",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN" , "EMPLOYEE", "TEAM_LEADER"]),
  templateController.getCustomerTemplate
);

router.put(
  "/customers/:customerId/description-template",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  templateController.updateCustomerTemplate
);

router.delete(
  "/customers/:customerId/description-template",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  templateController.deleteCustomerTemplate
);

// Order Description Data Routes (Admin and Employees)
router.post(
  "/orders/:orderId/description-data",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN", "EMPLOYEE", "TEAM_LEADER"]),
  templateController.createOrderDescriptionData
);

router.get(
  "/orders/:orderId/description-data",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN", "EMPLOYEE", "TEAM_LEADER"]),
  templateController.getOrderDescriptionData
);

router.put(
  "/orders/:orderId/description-data",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN", "EMPLOYEE", "TEAM_LEADER"]),
  templateController.updateOrderDescriptionData
);

router.get(
  "/orders/:orderId/with-template-data",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN", "EMPLOYEE", "TEAM_LEADER"]),
  templateController.getOrderWithTemplateData
);

export default router;