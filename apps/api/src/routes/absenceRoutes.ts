import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { prisma } from "@repo/db";

const router = express.Router();

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
      const userId = (req as any).user?.id;

      const absence = await prisma.absence.findUnique({
        where: { id },
        include: { employee: true },
      });

      if (!absence) {
        return res.status(404).json({ message: "Absence request not found" });
      }

      if (absence.status !== "PENDING") {
        return res.status(400).json({ message: "Absence request is not pending" });
      }

      const updatedAbsence = await prisma.absence.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedBy: userId,
          approvedAt: new Date(),
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

      if (absence.status !== "PENDING") {
        return res.status(400).json({ message: "Absence request is not pending" });
      }

      const updatedAbsence = await prisma.absence.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectedBy: userId,
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || "No reason provided",
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