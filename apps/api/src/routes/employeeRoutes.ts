import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
import { prisma } from "@repo/db";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  getAllEmployees
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  getEmployeeById
);

// Create new employee - Admin, HR Manager only
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  createEmployee
);

// Update employee - Admin, HR Manager, or own profile
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "EMPLOYEE"]),
  updateEmployee
);

// Delete employee - Admin only
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteEmployee
);

// Get employee assignments
router.get(
  "/:id/assignments",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  async (req, res) => {
    try {
      // Try to find employee by ID first, then by userId
      let employee = await prisma.employee.findUnique({
        where: { id: req.params.id },
      });

      if (!employee) {
        // If not found by employee ID, try by userId
        employee = await prisma.employee.findUnique({
          where: { userId: req.params.id },
        });
      }

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const assignments = await prisma.assignment.findMany({
        where: { employeeId: employee.id },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              scheduledDate: true,
              status: true,
              priority: true,
            },
          },
        },
        orderBy: { assignedDate: 'desc' },
      });
      res.json(assignments);
    } catch (error) {
      console.error("Get employee assignments error:", error);
      res.status(400).json({ 
        message: "Failed to fetch employee assignments", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get employee absences
router.get(
  "/:id/absences",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  async (req, res) => {
    try {
      // Try to find employee by ID first, then by userId
      let employee = await prisma.employee.findUnique({
        where: { id: req.params.id },
      });

      if (!employee) {
        employee = await prisma.employee.findUnique({
          where: { userId: req.params.id },
        });
      }

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const absences = await prisma.absence.findMany({
        where: { employeeId: employee.id },
        orderBy: { startDate: 'desc' },
      });
      res.json(absences);
    } catch (error) {
      console.error("Get employee absences error:", error);
      res.status(400).json({ 
        message: "Failed to fetch employee absences", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get user info by userId
router.get(
  "/user/:userId",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.userId },
        select: { email: true, username: true }
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Get user info error:", error);
      res.status(400).json({ 
        message: "Failed to fetch user info", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get employee work statistics
router.get(
  "/:id/work-statistics",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  async (req, res) => {
    try {
      // Try to find employee by ID first, then by userId
      let employee = await prisma.employee.findUnique({
        where: { id: req.params.id },
      });

      if (!employee) {
        employee = await prisma.employee.findUnique({
          where: { userId: req.params.id },
        });
      }

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const { startDate, endDate } = req.query;
      const where: any = { employeeId: employee.id };
      
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }
      
      const workStats = await prisma.workStatistic.findMany({
        where,
        orderBy: { date: 'desc' },
      });
      res.json(workStats);
    } catch (error) {
      console.error("Get employee work statistics error:", error);
      res.status(400).json({ 
        message: "Failed to fetch employee work statistics", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

export default router;
