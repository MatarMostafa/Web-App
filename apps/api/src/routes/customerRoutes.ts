import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { 
  getCustomerOrdersService, 
  getCustomerOrderByIdService,
  getCustomerProfileService,
  updateCustomerProfileService
} from "../services/customerService";
import { registerCustomer } from "../services/authService";
import { notifyCustomerBlocked, notifyCustomerUnblocked } from "../services/notificationHelpers";

const router = express.Router();

// Get customer's orders
router.get(
  "/me/orders",
  authMiddleware,
  roleMiddleware(["CUSTOMER"]),
  async (req, res) => {
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

      const orders = await getCustomerOrdersService(user.customer.id);
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error("Get customer orders error:", error);
      res.status(500).json({
        message: "Failed to fetch orders",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get single customer order
router.get(
  "/me/orders/:id",
  authMiddleware,
  roleMiddleware(["CUSTOMER"]),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const orderId = req.params.id;

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

      const order = await getCustomerOrderByIdService(user.customer.id, orderId);
      res.json({ success: true, data: order });
    } catch (error) {
      console.error("Get customer order error:", error);
      if (error instanceof Error && error.message.includes('access denied')) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.status(500).json({
        message: "Failed to fetch order",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get customer profile
router.get(
  "/me",
  authMiddleware,
  roleMiddleware(["CUSTOMER"]),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profile = await getCustomerProfileService(userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      console.error("Get customer profile error:", error);
      res.status(500).json({
        message: "Failed to fetch profile",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Update customer profile
router.put(
  "/me",
  authMiddleware,
  roleMiddleware(["CUSTOMER"]),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updatedProfile = await updateCustomerProfileService(userId, req.body);
      res.json({ 
        success: true, 
        data: updatedProfile,
        message: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Update customer profile error:", error);
      res.status(500).json({
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Admin customer management routes

// Get all customers (Admin only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { prisma } = await import("@repo/db");
      const customers = await prisma.customer.findMany({
        orderBy: { companyName: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true,
            },
          },
        },
      });
      
      // Prioritize user email over customer contactEmail
      const customersWithCorrectEmail = customers.map(customer => ({
        ...customer,
        contactEmail: customer.user?.email || customer.contactEmail,
      }));
      
      res.json(customersWithCorrectEmail);
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({
        message: "Failed to fetch customers",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Create customer (Admin only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { username, password, ...customerData } = req.body;
      const { prisma } = await import("@repo/db");
      
      let customer;
      
      if (username && password) {
        // Create customer with login account
        const result = await registerCustomer({
          username,
          password,
          email: customerData.contactEmail,
          ...customerData,
        });
        
        // Get the created customer with user relation
        customer = await prisma.customer.findFirst({
          where: { contactEmail: customerData.contactEmail },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                isActive: true,
              },
            },
          },
        });
      } else {
        // Create customer without login account
        customer = await prisma.customer.create({
          data: customerData,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                isActive: true,
              },
            },
          },
        });
      }
      
      res.status(201).json(customer);
    } catch (error) {
      console.error("Create customer error:", error);
      res.status(500).json({
        message: "Failed to create customer",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Update customer (Admin only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { contactEmail, ...customerData } = req.body;
      const { prisma } = await import("@repo/db");
      
      // Get current customer to check if it has a user account
      const currentCustomer = await prisma.customer.findUnique({
        where: { id },
        include: { user: true },
      });
      
      if (!currentCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Update customer data
      const customer = await prisma.customer.update({
        where: { id },
        data: {
          ...customerData,
          contactEmail,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true,
            },
          },
        },
      });
      
      // If customer has a user account and email changed, update user email too
      if (currentCustomer.userId && contactEmail && contactEmail !== currentCustomer.user?.email) {
        await prisma.user.update({
          where: { id: currentCustomer.userId },
          data: { email: contactEmail },
        });
        
        // Refresh customer data to get updated user email
        const updatedCustomer = await prisma.customer.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                isActive: true,
              },
            },
          },
        });
        
        const customerWithCorrectEmail = {
          ...updatedCustomer,
          contactEmail: updatedCustomer?.user?.email || updatedCustomer?.contactEmail,
        };
        
        return res.json(customerWithCorrectEmail);
      }
      
      // Prioritize user email over customer contactEmail
      const customerWithCorrectEmail = {
        ...customer,
        contactEmail: customer.user?.email || customer.contactEmail,
      };
      
      res.json(customerWithCorrectEmail);
    } catch (error) {
      console.error("Update customer error:", error);
      res.status(500).json({
        message: "Failed to update customer",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Block customer (Admin only)
router.post(
  "/:id/block",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const { prisma } = await import("@repo/db");

      
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: { user: true },
      });
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      if (!customer.userId) {
        return res.status(400).json({ message: "Customer has no user account to block" });
      }
      
      await prisma.customer.update({
        where: { id },
        data: { isActive: false },
      });
      
      // Send notification to customer
      await notifyCustomerBlocked(id, reason, req.user?.id);
      
      res.json({ message: "Customer blocked successfully" });
    } catch (error) {
      console.error("Block customer error:", error);
      res.status(500).json({
        message: "Failed to block customer",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Unblock customer (Admin only)
router.post(
  "/:id/unblock",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { prisma } = await import("@repo/db");

      
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: { user: true },
      });
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      if (!customer.userId) {
        return res.status(400).json({ message: "Customer has no user account to unblock" });
      }
      
      await prisma.customer.update({
        where: { id },
        data: { isActive: true },
      });
      
      // Send notification to customer
      await notifyCustomerUnblocked(id, req.user?.id);
      
      res.json({ message: "Customer unblocked successfully" });
    } catch (error) {
      console.error("Unblock customer error:", error);
      res.status(500).json({
        message: "Failed to unblock customer",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Delete customer (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { prisma } = await import("@repo/db");
      
      // Get customer with user relation
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: { user: true },
      });
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Delete customer first (due to foreign key constraint)
      await prisma.customer.delete({
        where: { id },
      });
      
      // Delete associated user account if exists
      if (customer.userId) {
        await prisma.user.delete({
          where: { id: customer.userId },
        });
      }
      
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Delete customer error:", error);
      res.status(500).json({
        message: "Failed to delete customer",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

export default router;