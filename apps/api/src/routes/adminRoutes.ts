import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  getBlockedEmplyees,
  unblockEmployee,
  getCustomerStatistics,
  getAverageValues,
  hoursperEmployee,
  exportOrdersCSV,
  getDashboardStatistics,
} from "../controllers/adminController";

const router = express.Router();

// Admin-only routes
router.get(
  "/blocks",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  getBlockedEmplyees
);
router.post(
  "/unblock",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  unblockEmployee
);
router.get(
  "/customerStatistics",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  getCustomerStatistics
);
router.get(
  "/averageValues",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  getAverageValues
);
router.get(
  "/hours",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  hoursperEmployee
);
router.get(
  "/export/csv",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  exportOrdersCSV
);
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  getDashboardStatistics
);

export default router;
