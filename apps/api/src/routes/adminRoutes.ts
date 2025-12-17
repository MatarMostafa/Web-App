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
import * as subAccountService from "../services/subAccountService";
import { AuthRequest } from "../middleware/authMiddleware";

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

// Sub-account management for admins
router.get(
  "/customers/:customerId/sub-accounts",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const subAccounts = await subAccountService.getSubAccountsByCustomer(customerId);
      res.json({ success: true, data: subAccounts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.post(
  "/customers/:customerId/sub-accounts",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  async (req, res) => {
    const authReq = req as AuthRequest;
    try {
      const { customerId } = req.params;
      const { name, username, password, email } = req.body;

      const result = await subAccountService.createSubAccount({
        name,
        username,
        password,
        email,
        customerId,
        createdBy: authReq.user?.id,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "FAILED_TO_CREATE";
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: errorMessage
      });
    }
  }
);

router.put(
  "/sub-accounts/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, isActive } = req.body;

      const updatedSubAccount = await subAccountService.updateSubAccount(id, {
        name,
        email,
        isActive,
      });

      res.json({ success: true, data: updatedSubAccount });
    } catch (error: any) {
      console.error("Update sub-account error:", error);
      res.status(500).json({
        message: "Failed to update sub-account",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

router.delete(
  "/sub-accounts/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      await subAccountService.deleteSubAccount(id);
      res.json({ message: "Sub-account deleted successfully" });
    } catch (error) {
      console.error("Delete sub-account error:", error);
      res.status(500).json({
        message: "Failed to delete sub-account",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

router.put(
  "/sub-accounts/:id/reset-password",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      await subAccountService.resetSubAccountPassword(id, newPassword);
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset sub-account password error:", error);
      res.status(500).json({
        message: "Failed to reset password",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

export default router;
