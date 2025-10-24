import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { prisma } from "@repo/db";
import * as statusService from "../services/employeeStatusService";

const router = express.Router();

// Create absence request (for employees)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["EMPLOYEE", "HR_MANAGER", "ADMIN"]),
  async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { type, startDate, endDate, reason } = req.body;
      
      if (!type || !startDate || !endDate) {
        return res.status(400).json({ 
          message: "Missing required fields: type, startDate, endDate" 
        });
      }

      const absence = await statusService.createAbsence({
        employeeUserId: userId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        requestedBy: userId,
      });

      res.status(201).json({
        message: "Leave request submitted successfully",
        absence,
      });
    } catch (error) {
      console.error("Create absence error:", error);
      res.status(400).json({
        message: "Failed to create leave request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get current user's absences
router.get(
  "/my-absences",
  authMiddleware,
  roleMiddleware(["EMPLOYEE", "HR_MANAGER", "ADMIN"]),
  async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const employee = await prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee profile not found" });
      }

      const absences = await prisma.absence.findMany({
        where: { employeeId: employee.id },
        orderBy: { createdAt: "desc" },
      });

      res.json(absences);
    } catch (error) {
      console.error("Get my absences error:", error);
      res.status(500).json({
        message: "Failed to fetch your absences",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get leave statistics for current user
router.get(
  "/my-stats",
  authMiddleware,
  roleMiddleware(["EMPLOYEE", "HR_MANAGER", "ADMIN"]),
  async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const employee = await prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee profile not found" });
      }

      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31);

      const absences = await prisma.absence.findMany({
        where: {
          employeeId: employee.id,
          startDate: { gte: yearStart },
          endDate: { lte: yearEnd },
        },
      });

      const stats = {
        totalDays: 0,
        approvedDays: 0,
        pendingDays: 0,
        rejectedDays: 0,
        byType: {} as Record<string, number>,
        byStatus: {
          PENDING: 0,
          APPROVED: 0,
          REJECTED: 0,
        },
      };

      absences.forEach(absence => {
        const days = Math.ceil(
          (new Date(absence.endDate).getTime() - new Date(absence.startDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        ) + 1;

        stats.totalDays += days;
        stats.byStatus[absence.status as keyof typeof stats.byStatus] += days;
        
        if (absence.status === 'APPROVED') stats.approvedDays += days;
        if (absence.status === 'PENDING') stats.pendingDays += days;
        if (absence.status === 'REJECTED') stats.rejectedDays += days;

        stats.byType[absence.type] = (stats.byType[absence.type] || 0) + days;
      });

      res.json(stats);
    } catch (error) {
      console.error("Get leave stats error:", error);
      res.status(500).json({
        message: "Failed to fetch leave statistics",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get all pending absences for approval
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  async (req, res) => {
    try {
      const pendingAbsences = await prisma.absence.findMany({
        where: { status: "PENDING" },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(pendingAbsences);
    } catch (error) {
      console.error("Get pending absences error:", error);
      res.status(500).json({
        message: "Failed to fetch pending absences",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Approve absence
router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { approvalReason } = req.body;
      const userId = (req as any).user?.id;

      const absence = await prisma.absence.findUnique({
        where: { id },
        include: { employee: true },
      });

      if (!absence) {
        return res.status(404).json({ message: "Absence request not found" });
      }

      const updatedAbsence = await prisma.absence.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedBy: userId,
          approvedAt: new Date(),
          rejectedBy: null,
          rejectedAt: null,
          rejectionReason: null,
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      });

      res.json({
        message: "Absence request approved successfully",
        absence: updatedAbsence,
      });
    } catch (error) {
      console.error("Approve absence error:", error);
      res.status(500).json({
        message: "Failed to approve absence request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Reject absence
router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const userId = (req as any).user?.id;

      const absence = await prisma.absence.findUnique({
        where: { id },
        include: { employee: true },
      });

      if (!absence) {
        return res.status(404).json({ message: "Absence request not found" });
      }

      const updatedAbsence = await prisma.absence.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectedBy: userId,
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || "No reason provided",
          approvedBy: null,
          approvedAt: null,
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      });

      res.json({
        message: "Absence request rejected successfully",
        absence: updatedAbsence,
      });
    } catch (error) {
      console.error("Reject absence error:", error);
      res.status(500).json({
        message: "Failed to reject absence request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get all absences with filters
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  async (req, res) => {
    try {
      const { status, type, employeeId } = req.query;
      
      const where: any = {};
      if (status) where.status = status;
      if (type) where.type = type;
      if (employeeId) where.employeeId = employeeId;
      
      const absences = await prisma.absence.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      
      res.json(absences);
    } catch (error) {
      console.error("Get absences error:", error);
      res.status(500).json({
        message: "Failed to fetch absences",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get absence by ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER", "EMPLOYEE"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const absence = await prisma.absence.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
      });

      if (!absence) {
        return res.status(404).json({ message: "Absence request not found" });
      }

      res.json(absence);
    } catch (error) {
      console.error("Get absence error:", error);
      res.status(500).json({
        message: "Failed to fetch absence request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

export default router;