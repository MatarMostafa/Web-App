import express from "express";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import * as subAccountService from "../services/subAccountService";

const router = express.Router();

// Customer routes - for customer admins to manage their sub-accounts
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["CUSTOMER"]),
  async (req: AuthRequest, res) => {
    try {
      const { name, username, password, email } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get customer ID from user
      const { prisma } = await import("@repo/db");
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { customer: true },
      });

      if (!user?.customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      const result = await subAccountService.createSubAccount({
        name,
        username,
        password,
        email,
        customerId: user.customer.id,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Create sub-account error:", error);
      const errorMessage = error instanceof Error ? error.message : "FAILED_TO_CREATE";
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: errorMessage
      });
    }
  }
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["CUSTOMER"]),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get customer ID from user
      const { prisma } = await import("@repo/db");
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { customer: true },
      });

      if (!user?.customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      const subAccounts = await subAccountService.getSubAccountsByCustomer(user.customer.id);
      res.json({ success: true, data: subAccounts });
    } catch (error) {
      console.error("Get sub-accounts error:", error);
      res.status(500).json({
        message: "Failed to fetch sub-accounts",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["CUSTOMER"]),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { name, email, isActive } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get customer ID from user
      const { prisma } = await import("@repo/db");
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { customer: true },
      });

      if (!user?.customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      // Verify sub-account belongs to this customer
      const existingSubAccount = await subAccountService.getSubAccountById(id);
      if (!existingSubAccount || existingSubAccount.customerId !== user.customer.id) {
        return res.status(404).json({ message: "Sub-account not found" });
      }

      const updatedSubAccount = await subAccountService.updateSubAccount(id, {
        name,
        email,
        isActive,
      });

      res.json({ success: true, data: updatedSubAccount });
    } catch (error) {
      console.error("Update sub-account error:", error);
      res.status(500).json({
        message: "Failed to update sub-account",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["CUSTOMER"]),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get customer ID from user
      const { prisma } = await import("@repo/db");
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { customer: true },
      });

      if (!user?.customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      // Verify sub-account belongs to this customer
      const existingSubAccount = await subAccountService.getSubAccountById(id);
      if (!existingSubAccount || existingSubAccount.customerId !== user.customer.id) {
        return res.status(404).json({ message: "Sub-account not found" });
      }

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
  "/:id/reset-password",
  authMiddleware,
  roleMiddleware(["CUSTOMER"]),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Get customer ID from user
      const { prisma } = await import("@repo/db");
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { customer: true },
      });

      if (!user?.customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      // Verify sub-account belongs to this customer
      const existingSubAccount = await subAccountService.getSubAccountById(id);
      if (!existingSubAccount || existingSubAccount.customerId !== user.customer.id) {
        return res.status(404).json({ message: "Sub-account not found" });
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