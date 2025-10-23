import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  exportOrders,
  exportEmployeePerformance,
  exportAssignmentDetails,
  exportCustomerAnalytics,
  exportEmployeeQualifications,
  exportWorkStatistics,
} from "../controllers/exportController";

const router = express.Router();

/**
 * @section Core Business Exports
 */

// Export orders with filters
router.get(
  "/orders",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  exportOrders
);

// Export employee performance data
router.get(
  "/employee-performance",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  exportEmployeePerformance
);

// Export all assignment details
router.get(
  "/assignment-details",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  exportAssignmentDetails
);

// Export assignment details for specific order
router.get(
  "/assignment-details/:orderId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  exportAssignmentDetails
);

// Export all customer analytics
router.get(
  "/customer-analytics",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  exportCustomerAnalytics
);

// Export customer analytics for specific customer
router.get(
  "/customer-analytics/:customerId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  exportCustomerAnalytics
);

/**
 * @section HR & Workforce Management Exports
 */

// Export employee qualifications and certifications
router.get(
  "/employee-qualifications",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  exportEmployeeQualifications
);

// Export work statistics and productivity data
router.get(
  "/work-statistics",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  exportWorkStatistics
);

export default router;