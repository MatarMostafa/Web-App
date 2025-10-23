import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { prisma } from "@repo/db";

const router = express.Router();

// Get all qualifications
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  async (req, res) => {
    try {
      const qualifications = await prisma.qualification.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });
      res.json(qualifications);
    } catch (error) {
      console.error("Get qualifications error:", error);
      res.status(500).json({
        message: "Failed to fetch qualifications",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get employee qualifications
router.get(
  "/employee/:employeeId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  async (req, res) => {
    try {
      const { employeeId } = req.params;
      const qualifications = await prisma.employeeQualification.findMany({
        where: { employeeId },
        include: {
          qualification: true,
        },
        orderBy: { acquiredDate: "desc" },
      });
      res.json(qualifications);
    } catch (error) {
      console.error("Get employee qualifications error:", error);
      res.status(500).json({
        message: "Failed to fetch employee qualifications",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Add qualification to employee
router.post(
  "/employee/:employeeId",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { qualificationId, proficiencyLevel, expiryDate, certificateUrl } = req.body;

      const employeeQualification = await prisma.employeeQualification.create({
        data: {
          employeeId,
          qualificationId,
          proficiencyLevel: proficiencyLevel || 1,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
          certificateUrl,
        },
        include: {
          qualification: true,
        },
      });

      res.status(201).json({
        message: "Qualification added successfully",
        qualification: employeeQualification
      });
    } catch (error) {
      console.error("Add employee qualification error:", error);
      res.status(500).json({
        message: "Failed to add qualification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Update employee qualification
router.put(
  "/employee/:employeeId/:qualificationId",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { employeeId, qualificationId } = req.params;
      const { proficiencyLevel, expiryDate, certificateUrl, isVerified } = req.body;

      const updatedQualification = await prisma.employeeQualification.update({
        where: {
          employeeId_qualificationId: {
            employeeId,
            qualificationId,
          },
        },
        data: {
          proficiencyLevel,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
          certificateUrl,
          isVerified,
        },
        include: {
          qualification: true,
        },
      });

      res.json({
        message: "Qualification updated successfully",
        qualification: updatedQualification
      });
    } catch (error) {
      console.error("Update employee qualification error:", error);
      res.status(500).json({
        message: "Failed to update qualification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Remove qualification from employee
router.delete(
  "/employee/:employeeId/:qualificationId",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { employeeId, qualificationId } = req.params;

      await prisma.employeeQualification.delete({
        where: {
          employeeId_qualificationId: {
            employeeId,
            qualificationId,
          },
        },
      });

      res.json({
        message: "Qualification removed successfully"
      });
    } catch (error) {
      console.error("Remove employee qualification error:", error);
      res.status(500).json({
        message: "Failed to remove qualification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

export default router;