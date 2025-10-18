import express from "express";
import employeeRoutes from "./employeeRoutes";
import employeeStatusRoutes from "./employeeStatusRoutes";
import authRoutes from "./core/authRoutes";
import customerRoutes from "./customerRoutes";
import orderRoutes from "./orderRoutes";
import employeePerformanceRoutes from "./employeePerformanceRoutes";
import performanceThresholdRoutes from "./performanceThresholdRoutes";
import notificationRoutes from "./notificationRoutes";
import adminRoutes from "./adminRoutes";

const router = express.Router();

// Auth Routes
router.use("/auth", authRoutes);

// Employee routes
router.use("/employees", employeeRoutes);
router.use("/employees-status", employeeStatusRoutes);

// Customers
router.use("/customers", customerRoutes);

// Orders
router.use("/orders", orderRoutes);

// Performance-related routes
router.use("/performance", employeePerformanceRoutes);
router.use("/performance", performanceThresholdRoutes);

// Notifications routes
router.use("/notifications", notificationRoutes);

// Admin routes
router.use("/admin", adminRoutes);

export default router;
