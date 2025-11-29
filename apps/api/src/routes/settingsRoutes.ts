import express from "express";
import bcrypt from "bcryptjs";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "@repo/db";
import {
  createSettingsChangeRequest,
  getMySettingsRequests,
  getPendingSettingsRequests,
  reviewSettingsRequest,
} from "../services/settingsChangeService";

const router = express.Router();

// Change password for any user type
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// Update employee phone number
router.post("/employee/phone", authMiddleware, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find employee by user ID
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update phone number
    await prisma.employee.update({
      where: { id: employee.id },
      data: { phoneNumber }
    });

    res.json({ message: "Phone number updated successfully" });
  } catch (error) {
    console.error("Update employee phone error:", error);
    res.status(500).json({ message: "Failed to update phone number" });
  }
});

// Update customer phone number  
router.post("/customer/phone", authMiddleware, async (req, res) => {
  try {
    const { contactPhone } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find customer by user ID
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update phone number
    await prisma.customer.update({
      where: { id: customer.id },
      data: { contactPhone }
    });

    res.json({ message: "Phone number updated successfully" });
  } catch (error) {
    console.error("Update customer phone error:", error);
    res.status(500).json({ message: "Failed to update phone number" });
  }
});

// Update customer address
router.post("/customer/address", authMiddleware, async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find customer by user ID
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update address
    await prisma.customer.update({
      where: { id: customer.id },
      data: { address }
    });

    res.json({ message: "Address updated successfully" });
  } catch (error) {
    console.error("Update customer address error:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
});

// Update customer industry
router.post("/customer/industry", authMiddleware, async (req, res) => {
  try {
    const { industry } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find customer by user ID
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update industry
    await prisma.customer.update({
      where: { id: customer.id },
      data: { industry }
    });

    res.json({ message: "Industry updated successfully" });
  } catch (error) {
    console.error("Update customer industry error:", error);
    res.status(500).json({ message: "Failed to update industry" });
  }
});

// Update admin name (instant - no approval needed)
router.post("/admin/name", authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !['ADMIN', 'SUPER_ADMIN'].includes(userRole || '')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Update employee record (admins are in employees table)
    await prisma.employee.update({
      where: { userId },
      data: {
        firstName,
        lastName,
      },
    });

    res.json({ message: "Name updated successfully" });
  } catch (error) {
    console.error("Update admin name error:", error);
    res.status(500).json({ message: "Failed to update name" });
  }
});

// Update admin email (instant - no approval needed)
router.post("/admin/email", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !['ADMIN', 'SUPER_ADMIN'].includes(userRole || '')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Update email directly (no notifications for admin)
    await prisma.user.update({
      where: { id: userId },
      data: { email },
    });

    res.json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Update admin email error:", error);
    res.status(500).json({ message: "Failed to update email" });
  }
});



// Request name change (requires admin approval)
router.post("/request-name-change", authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get current employee info
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { firstName: true, lastName: true },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Create requests for changed fields
    const requests = [];
    
    if (firstName && firstName !== employee.firstName) {
      const request = await createSettingsChangeRequest(
        userId,
        "FIRST_NAME",
        employee.firstName,
        firstName,
        reason
      );
      requests.push(request);
    }

    if (lastName && lastName !== employee.lastName) {
      const request = await createSettingsChangeRequest(
        userId,
        "LAST_NAME",
        employee.lastName,
        lastName,
        reason
      );
      requests.push(request);
    }

    if (requests.length === 0) {
      return res.status(400).json({ message: "No changes requested" });
    }

    res.json({ 
      message: "Name change request submitted successfully",
      requests: requests.length 
    });
  } catch (error: any) {
    console.error("Request name change error:", error);
    res.status(500).json({ message: error.message || "Failed to submit name change request" });
  }
});



// Request email change (requires admin approval + email verification)
router.post("/request-email-change", authMiddleware, async (req, res) => {
  try {
    const { email, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get current user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email === user.email) {
      return res.status(400).json({ message: "New email is the same as current email" });
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const request = await createSettingsChangeRequest(
      userId,
      "EMAIL_ADDRESS",
      user.email,
      email,
      reason
    );

    res.json({ 
      message: "Email change request submitted successfully",
      requestId: request.id 
    });
  } catch (error: any) {
    console.error("Request email change error:", error);
    res.status(500).json({ message: error.message || "Failed to submit email change request" });
  }
});

// Request company info change (requires admin approval)
router.post("/request-company-change", authMiddleware, async (req, res) => {
  try {
    const { companyName, taxNumber, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get current customer info
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { companyName: true, taxNumber: true },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Create requests for changed fields
    const requests = [];
    
    if (companyName && companyName !== customer.companyName) {
      const request = await createSettingsChangeRequest(
        userId,
        "COMPANY_NAME",
        customer.companyName,
        companyName,
        reason
      );
      requests.push(request);
    }

    if (taxNumber && taxNumber !== customer.taxNumber) {
      const request = await createSettingsChangeRequest(
        userId,
        "TAX_NUMBER",
        customer.taxNumber,
        taxNumber,
        reason
      );
      requests.push(request);
    }

    if (requests.length === 0) {
      return res.status(400).json({ message: "No changes requested" });
    }

    res.json({ 
      message: "Company information change request submitted successfully",
      requests: requests.length 
    });
  } catch (error: any) {
    console.error("Request company change error:", error);
    res.status(500).json({ message: error.message || "Failed to submit company change request" });
  }
});

// Get my settings change requests
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requests = await getMySettingsRequests(userId);
    res.json(requests);
  } catch (error) {
    console.error("Get my requests error:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// Reset employee password (Admin only)
router.post("/reset-employee-password", authMiddleware, async (req, res) => {
  try {
    const { employeeId, newPassword } = req.body;
    const userRole = req.user?.role;

    if (!['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(userRole || '')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!employeeId || !newPassword) {
      return res.status(400).json({ message: "Employee ID and new password are required" });
    }

    // Find employee and get user ID
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { userId: true, firstName: true, lastName: true }
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: employee.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset employee password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Reset customer password (Admin only)
router.post("/reset-customer-password", authMiddleware, async (req, res) => {
  try {
    const { customerId, newPassword } = req.body;
    const userRole = req.user?.role;

    if (!['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(userRole || '')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!customerId || !newPassword) {
      return res.status(400).json({ message: "Customer ID and new password are required" });
    }

    // Find customer and check if has user account
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { userId: true, companyName: true }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!customer.userId) {
      return res.status(400).json({ message: "Customer does not have a login account" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: customer.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset customer password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Create customer account (Admin only)
router.post("/create-customer-account", authMiddleware, async (req, res) => {
  try {
    const { customerId, username, password } = req.body;
    const userRole = req.user?.role;

    if (!['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(userRole || '')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!customerId || !username || !password) {
      return res.status(400).json({ message: "Customer ID, username, and password are required" });
    }

    // Find customer and check if already has account
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { userId: true, companyName: true, contactEmail: true }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (customer.userId) {
      return res.status(400).json({ message: "Customer already has a login account" });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user account
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: customer.contactEmail,
        role: "CUSTOMER",
        isActive: true,
        createdBy: req.user?.id
      }
    });

    // Link user to customer
    await prisma.customer.update({
      where: { id: customerId },
      data: { userId: user.id }
    });

    res.json({ 
      message: "Customer account created successfully",
      username,
      userId: user.id
    });
  } catch (error) {
    console.error("Create customer account error:", error);
    res.status(500).json({ message: "Failed to create customer account" });
  }
});

export default router;