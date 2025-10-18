// src/routes/performanceThresholdRoutes.ts

// future enhancements if needed:
// recalculation of employee performances based on new threshhold for departments

import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  createPerformanceThresholdSchema,
  updatePerformanceThresholdSchema,
  deletePerformanceThresholdSchema,
} from "../validation/performanceThresholdSchemas";
import * as controller from "../controllers/performanceThresholdController";

const router = Router();

// Get all thresholds (admin/HR only)
router.get(
  "/performance-thresholds",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  controller.listAll
);

// Get threshold config for one department
router.get(
  "/departments/:id/performance-threshold",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  controller.getByDepartment
);

// Create threshold config for a department
router.post(
  "/departments/:id/performance-threshold",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validateRequest(createPerformanceThresholdSchema),
  controller.create
);

// Update threshold config
router.put(
  "/performance-thresholds/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validateRequest(updatePerformanceThresholdSchema),
  controller.update
);

// Delete threshold config
router.delete(
  "/performance-thresholds/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validateRequest(deletePerformanceThresholdSchema),
  controller.remove
);

// Initialize default thresholds for all departments without them
router.post(
  "/performance-thresholds/initialize-defaults",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.initializeDefaults
);

export default router;
