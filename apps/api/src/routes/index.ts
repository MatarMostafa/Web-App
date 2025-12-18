import express from "express";
import employeeRoutes from "./employeeRoutes";
import employeeStatusRoutes from "./employeeStatusRoutes";
import employeeDashboardRoutes from "./employeeDashboardRoutes";
import authRoutes from "./core/authRoutes";
import customerRoutes from "./customerRoutes";
import orderRoutes from "./orderRoutes";
import employeePerformanceRoutes from "./employeePerformanceRoutes";
import performanceThresholdRoutes from "./performanceThresholdRoutes";
import notificationRoutes from "./notificationRoutes";
import adminRoutes from "./adminRoutes";
import departmentRoutes from "./departmentRoutes";
import positionRoutes from "./positionRoutes";
import managerRoutes from "./managerRoutes";
import fileRoutes from "./fileRoutes";
import qualificationRoutes from "./qualificationRoutes";
import absenceRoutes from "./absenceRoutes";
import settingsRoutes from "./settingsRoutes";
import subAccountRoutes from "./subAccountRoutes";
import teamRoutes from "./teamRoutes";
import teamLeaderRoutes from "./teamLeaderRoutes";
import customerPricingRoutes from "./customerPricingRoutes";

const router = express.Router();

// Auth Routes
router.use("/auth", authRoutes);

// Employee routes
router.use("/employees", employeeRoutes);
router.use("/employees-status", employeeStatusRoutes);
router.use("/employee", employeeDashboardRoutes);

// Organization structure
router.use("/departments", departmentRoutes);
router.use("/positions", positionRoutes);
router.use("/managers", managerRoutes);

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

// File management routes
router.use("/files", fileRoutes);

// Qualification routes
router.use("/qualifications", qualificationRoutes);

// Absence approval routes
router.use("/absences", absenceRoutes);

// Settings routes
router.use("/settings", settingsRoutes);

// Sub-account routes
router.use("/sub-accounts", subAccountRoutes);

// Team routes
router.use("/teams", teamRoutes);

// Team Leader routes
router.use("/team-leader", teamLeaderRoutes);

// Customer Pricing routes
router.use("/pricing", customerPricingRoutes);

export default router;
