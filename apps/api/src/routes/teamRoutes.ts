import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getTeamByLeader,
  getAvailableEmployees,
} from "../controllers/teamController";

const router = express.Router();

// Get all teams - Admin and Team Leaders
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  getAllTeams
);

// Get team by ID - Admin and Team Leaders
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  getTeamById
);

// Create team - Admin only
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  createTeam
);

// Update team - Admin only
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateTeam
);

// Delete team - Admin only
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteTeam
);

// Get available employees for team - Admin only
router.get(
  "/:teamId/available-employees",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getAvailableEmployees
);

// Add team member - Admin only
router.post(
  "/:teamId/members",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  addTeamMember
);

// Remove team member - Admin only
router.delete(
  "/:teamId/members/:employeeId",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  removeTeamMember
);

// Get team by leader - Admin and Team Leaders
router.get(
  "/leader/:leaderId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  getTeamByLeader
);

export default router;