// src/routes/employeePerformanceRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  createEmployeePerformanceSchema,
  updateEmployeePerformanceSchema,
  deleteEmployeePerformanceSchema,
} from "../validation/employeePerformanceSchemas";
import * as controller from "../controllers/employeePerformanceController";

const router = Router();

// List all employee performance records (admin, HR, team leads)
router.get(
  "/employee-performance",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  controller.listAll
);

// Get single performance record by ID
router.get(
  "/employee-performance/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER", "EMPLOYEE"]),
  controller.getById
);

// Get all performance history for one employee
router.get(
  "/employees/:id/performance",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER", "EMPLOYEE"]),
  controller.getEmployeeHistory
);

// Create a new performance evaluation
router.post(
  "/employee-performance",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(createEmployeePerformanceSchema),
  controller.create
);

// Update a performance record
router.put(
  "/employee-performance/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(updateEmployeePerformanceSchema),
  controller.update
);

// Delete a performance record
router.delete(
  "/employee-performance/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validateRequest(deleteEmployeePerformanceSchema),
  controller.remove
);

export default router;
