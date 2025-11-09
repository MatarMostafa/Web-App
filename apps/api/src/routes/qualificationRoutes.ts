import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { prisma } from "@repo/db";
import { notifySkillAdded, notifySkillApproved, notifySkillRejected } from "../services/notificationHelpers";

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

// Get all qualifications for admin management (including inactive)
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const qualifications = await prisma.qualification.findMany({
        orderBy: { name: "asc" },
      });
      res.json(qualifications);
    } catch (error) {
      console.error("Get all qualifications error:", error);
      res.status(500).json({
        message: "Failed to fetch qualifications",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Create new qualification (Admin only)
router.post(
  "/admin",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { name, description, category } = req.body;
      
      const qualification = await prisma.qualification.create({
        data: {
          name,
          description,
          category,
          isActive: true,
        },
      });
      
      res.status(201).json({
        message: "Qualification created successfully",
        qualification
      });
    } catch (error) {
      console.error("Create qualification error:", error);
      res.status(500).json({
        message: "Failed to create qualification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Update qualification (Admin only)
router.put(
  "/admin/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category, isActive } = req.body;
      
      const qualification = await prisma.qualification.update({
        where: { id },
        data: {
          name,
          description,
          category,
          isActive,
        },
      });
      
      res.json({
        message: "Qualification updated successfully",
        qualification
      });
    } catch (error) {
      console.error("Update qualification error:", error);
      res.status(500).json({
        message: "Failed to update qualification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Delete qualification (Admin only)
router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if qualification is in use
      const inUse = await prisma.employeeQualification.findFirst({
        where: { qualificationId: id },
      });
      
      if (inUse) {
        // Soft delete - deactivate instead of hard delete
        await prisma.qualification.update({
          where: { id },
          data: { isActive: false },
        });
        
        res.json({
          message: "Qualification deactivated (was in use by employees)"
        });
      } else {
        // Hard delete if not in use
        await prisma.qualification.delete({
          where: { id },
        });
        
        res.json({
          message: "Qualification deleted successfully"
        });
      }
    } catch (error) {
      console.error("Delete qualification error:", error);
      res.status(500).json({
        message: "Failed to delete qualification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Get employee qualifications (Admin)
router.get(
  "/employee/:employeeId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
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

// Get my qualifications
router.get(
  "/my-qualifications",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "EMPLOYEE"]),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const employee = await prisma.employee.findUnique({
        where: { userId }
      });
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const qualifications = await prisma.employeeQualification.findMany({
        where: { employeeId: employee.id },
        include: {
          qualification: true,
        },
        orderBy: { acquiredDate: "desc" },
      });
      res.json(qualifications);
    } catch (error) {
      console.error("Get my qualifications error:", error);
      res.status(500).json({
        message: "Failed to fetch qualifications",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Add qualification to my profile
router.post(
  "/my-qualifications",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "EMPLOYEE"]),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { qualificationId, proficiencyLevel, expiryDate, certificateUrl } = req.body;

      const employee = await prisma.employee.findUnique({
        where: { userId }
      });
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const employeeQualification = await prisma.employeeQualification.create({
        data: {
          employeeId: employee.id,
          qualificationId,
          proficiencyLevel: proficiencyLevel || 1,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
          certificateUrl,
        },
        include: {
          qualification: true,
        },
      });

      // Send notification to admins
      await notifySkillAdded(employee.id, employeeQualification.qualification.name);

      res.status(201).json({
        message: "Qualification added successfully",
        qualification: employeeQualification
      });
    } catch (error) {
      console.error("Add qualification error:", error);
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
  roleMiddleware(["ADMIN", "HR_MANAGER", "EMPLOYEE"]),
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

// Approve employee qualification (Admin only)
router.put(
  "/employee/:employeeId/:qualificationId/approve",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { employeeId, qualificationId } = req.params;

      const updatedQualification = await prisma.employeeQualification.update({
        where: {
          employeeId_qualificationId: {
            employeeId,
            qualificationId,
          },
        },
        data: {
          isVerified: true,
        },
        include: {
          qualification: true,
        },
      });

      // Send notification to employee and refresh admin UI
      await notifySkillApproved(employeeId, updatedQualification.qualification.name);
      
      // Trigger admin UI refresh
      setTimeout(() => {
        // This would be handled by the frontend polling or real-time updates
      }, 100);

      res.json({
        message: "Qualification approved successfully",
        qualification: updatedQualification
      });
    } catch (error) {
      console.error("Approve employee qualification error:", error);
      res.status(500).json({
        message: "Failed to approve qualification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Reject employee qualification (Admin only)
router.put(
  "/employee/:employeeId/:qualificationId/reject",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const { employeeId, qualificationId } = req.params;
      const { rejectionReason } = req.body;

      // Get qualification name before deletion
      const qualification = await prisma.employeeQualification.findUnique({
        where: {
          employeeId_qualificationId: {
            employeeId,
            qualificationId,
          },
        },
        include: {
          qualification: true,
        },
      });

      if (qualification) {
        // Delete the qualification
        await prisma.employeeQualification.delete({
          where: {
            employeeId_qualificationId: {
              employeeId,
              qualificationId,
            },
          },
        });

        // Send notification to employee
        await notifySkillRejected(employeeId, qualification.qualification.name, rejectionReason);
      }

      res.json({
        message: "Qualification rejected and removed",
        rejectionReason
      });
    } catch (error) {
      console.error("Reject employee qualification error:", error);
      res.status(500).json({
        message: "Failed to reject qualification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Add qualification to employee (Admin only)
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
          isVerified: true, // Admin-added skills are automatically verified
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

// Remove qualification from my profile
router.delete(
  "/my-qualifications/:qualificationId",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "EMPLOYEE"]),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { qualificationId } = req.params;

      const employee = await prisma.employee.findUnique({
        where: { userId }
      });
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      await prisma.employeeQualification.delete({
        where: {
          employeeId_qualificationId: {
            employeeId: employee.id,
            qualificationId,
          },
        },
      });

      res.json({
        message: "Qualification removed successfully"
      });
    } catch (error) {
      console.error("Remove qualification error:", error);
      res.status(500).json({
        message: "Failed to remove qualification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Remove qualification from employee (Admin only)
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

// Get qualification categories
router.get(
  "/admin/categories",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const categories = await prisma.qualification.findMany({
        select: { category: true },
        distinct: ['category'],
        where: { isActive: true },
        orderBy: { category: 'asc' },
      });
      
      res.json(categories.map(c => c.category).filter(Boolean));
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({
        message: "Failed to fetch categories",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

export default router;