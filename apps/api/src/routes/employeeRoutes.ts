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
      // First find the employee by userId
      const employee = await prisma.employee.findUnique({
        where: { userId: req.params.id },
      });

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
              title: true,
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

export default router;
