import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  getCurrentWeekOrders,
  getArchivedOrders,
  getDashboardStats,
  updateOrderStatus,
  triggerWeeklyArchive,
} from "../controllers/employeeDashboardController";

const router = express.Router();

// Get current week orders for employee
router.get(
  "/current-week-orders",
  authMiddleware,
  roleMiddleware(["EMPLOYEE"]),
  getCurrentWeekOrders
);

// Get archived orders for employee
router.get(
  "/archived-orders",
  authMiddleware,
  roleMiddleware(["EMPLOYEE"]),
  getArchivedOrders
);

// Get dashboard statistics for employee
router.get(
  "/dashboard-stats",
  authMiddleware,
  roleMiddleware(["EMPLOYEE"]),
  getDashboardStats
);

// Update order status
router.put(
  "/orders/:orderId/status",
  authMiddleware,
  roleMiddleware(["EMPLOYEE"]),
  updateOrderStatus
);

// Trigger weekly archive (admin only for manual trigger)
router.post(
  "/archive/trigger",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  triggerWeeklyArchive
);

export default router;