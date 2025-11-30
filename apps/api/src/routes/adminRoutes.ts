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
import {
  getPendingSettingsRequests,
  reviewSettingsRequest,
} from "../services/settingsChangeService";

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

// Settings change requests management
router.get(
  "/settings/pending-requests",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "SUPER_ADMIN"]),
  async (req, res) => {
    try {
      const requests = await getPendingSettingsRequests();
      console.log("Fetched requests:", requests);
      res.json(requests);
    } catch (error: any) {
      console.error("Get pending requests error:", error);
      res.status(500).json({ message: "Failed to fetch pending requests", error: error.message });
    }
  }
);

router.post(
  "/settings/approve-request/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "SUPER_ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const reviewerId = req.user?.id;

      if (!reviewerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const request = await reviewSettingsRequest(id, reviewerId, "APPROVED", reviewNotes);
      res.json({ message: "Request approved successfully", request });
    } catch (error: any) {
      console.error("Approve request error:", error);
      res.status(500).json({ message: error.message || "Failed to approve request" });
    }
  }
);

router.post(
  "/settings/reject-request/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "SUPER_ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const reviewerId = req.user?.id;

      if (!reviewerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!reviewNotes) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const request = await reviewSettingsRequest(id, reviewerId, "REJECTED", reviewNotes);
      res.json({ message: "Request rejected successfully", request });
    } catch (error: any) {
      console.error("Reject request error:", error);
      res.status(500).json({ message: error.message || "Failed to reject request" });
    }
  }
);

export default router;
