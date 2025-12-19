import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  exportEmployeeAssignments,
  exportEmployeeWorkStats,
  exportCombinedEmployeeData,
} from "../controllers/employeeController";
import { prisma } from "@repo/db";

const router = express.Router();

// Get current employee's profile
router.get(
  "/me",
  authMiddleware,
  roleMiddleware(["EMPLOYEE", "ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          },
          position: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee profile not found" });
      }

      // Add user's email to the main response for consistency
      const response = {
        ...employee,
        email: employee.user?.email, // Add user's email at top level
      };

      res.json(response);
    } catch (error) {
      console.error("Get employee profile error:", error);
      res.status(500).json({ message: "Failed to fetch employee profile" });
    }
  }
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  getAllEmployees
);

// Export routes (must come before /:id routes)
router.get(
  "/export/assignments",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { period = 'monthly', startDate, endDate, employeeId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      // If employeeId is provided, validate it exists
      if (employeeId) {
        const employee = await prisma.employee.findUnique({
          where: { id: employeeId as string },
        });
        if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
        }
      }

      await exportEmployeeAssignments(req, res);
    } catch (error) {
      console.error('Export assignments error:', error);
      res.status(500).json({ message: "Error exporting employee assignments", error });
    }
  }
);

router.get(
  "/export/work-stats",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  exportEmployeeWorkStats
);

router.get(
  "/export/combined",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  exportCombinedEmployeeData
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
              description: true,
              scheduledDate: true,
              startTime: true,
              endTime: true,
              duration: true,
              location: true,
              requiredEmployees: true,
              priority: true,
              specialInstructions: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              customer: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
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

// Export employee assignments as CSV
router.get(
  "/:id/export/assignments",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period = 'monthly', startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      // Try to find employee by ID first, then by userId
      let employee = await prisma.employee.findUnique({
        where: { id },
      });

      if (!employee) {
        employee = await prisma.employee.findUnique({
          where: { userId: id },
        });
      }

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Call the export function with the found employee ID
      req.query.employeeId = employee.id;
      await exportEmployeeAssignments(req, res);
    } catch (error) {
      console.error('Export assignments error:', error);
      res.status(500).json({ message: "Error exporting employee assignments", error });
    }
  }
);

// Export employee work statistics as CSV
router.get(
  "/:id/export/work-stats",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period = 'monthly', startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      // Try to find employee by ID first, then by userId
      let employee = await prisma.employee.findUnique({
        where: { id },
      });

      if (!employee) {
        employee = await prisma.employee.findUnique({
          where: { userId: id },
        });
      }

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Call the export function with the found employee ID
      req.query.employeeId = employee.id;
      await exportEmployeeWorkStats(req, res);
    } catch (error) {
      console.error('Export work stats error:', error);
      res.status(500).json({ message: "Error exporting work statistics", error });
    }
  }
);

// Export combined employee data as CSV
router.get(
  "/:id/export/combined",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period = 'monthly', startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      // Try to find employee by ID first, then by userId
      let employee = await prisma.employee.findUnique({
        where: { id },
      });

      if (!employee) {
        employee = await prisma.employee.findUnique({
          where: { userId: id },
        });
      }

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Call the export function with the found employee ID
      req.query.employeeId = employee.id;
      await exportCombinedEmployeeData(req, res);
    } catch (error) {
      console.error('Export combined data error:', error);
      res.status(500).json({ message: "Error exporting combined employee data", error });
    }
  }
);



export default router;
