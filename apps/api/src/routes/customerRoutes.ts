// src/routes/customerRoutes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  createCustomerSchema,
  deleteCustomerSchema,
  updateCustomerSchema,
  createSubAccountSchema,
  updateSubAccountSchema,
  deleteSubAccountSchema
} from "../validation/customerSchemas";
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createSubAccount,
  getSubAccounts,
  updateSubAccount,
  deleteSubAccount
} from "../controllers/customerController";

const router = express.Router();

/**
 * @route GET /api/customers
 * @desc Get all customers
 * @access ADMIN, HR_MANAGER
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  getAllCustomers
);

/**
 * @route GET /api/customers/:id
 * @desc Get customer by ID (including subAccounts, orders, ratings if needed)
 * @access ADMIN, HR_MANAGER, TEAM_LEADER
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  getCustomerById
);

/**
 * @route POST /api/customers
 * @desc Create new customer
 * @access ADMIN, HR_MANAGER
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(createCustomerSchema),
  createCustomer
);

/**
 * @route PUT /api/customers/:id
 * @desc Update customer details
 * @access ADMIN, HR_MANAGER
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(updateCustomerSchema),
  updateCustomer
);

/**
 * @route DELETE /api/customers/:id
 * @desc Delete customer (cascades to subAccounts, orders, ratings due to Prisma schema)
 * @access ADMIN
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validateRequest(deleteCustomerSchema),
  deleteCustomer
);

// --- SubAccount Routes ---

/**
 * @route POST /api/customers/:customerId/subaccounts
 * @desc Create a subaccount under a customer
 * @access ADMIN, HR_MANAGER
 */
router.post(
  "/:customerId/subaccounts",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(createSubAccountSchema),
  createSubAccount
);

/**
 * @route GET /api/customers/:customerId/subaccounts
 * @desc Get all subaccounts for a customer
 * @access ADMIN, HR_MANAGER, TEAM_LEADER
 */
router.get(
  "/:customerId/subaccounts",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  getSubAccounts
);

/**
 * @route PUT /api/customers/:customerId/subaccounts/:id
 * @desc Update a subaccount
 * @access ADMIN, HR_MANAGER
 */
router.put(
  "/:customerId/subaccounts/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(updateSubAccountSchema),
  updateSubAccount
);

/**
 * @route DELETE /api/customers/:customerId/subaccounts/:id
 * @desc Delete a subaccount
 * @access ADMIN
 */
router.delete(
  "/:customerId/subaccounts/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validateRequest(deleteSubAccountSchema),
  deleteSubAccount
);

export default router;