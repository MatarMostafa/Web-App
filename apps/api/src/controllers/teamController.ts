import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as teamService from "../services/teamService";

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await teamService.getAllTeams();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams", error });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = await teamService.getTeamById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team", error });
  }
};

export const createTeam = async (req: Request, res: Response) => {
  try {
    const team = await teamService.createTeam(req.body);
    res.status(201).json(team);
  } catch (error: any) {
    console.error("Error creating team:", error);
    const message = error.message || "Error creating team";
    res.status(400).json({ message });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = await teamService.updateTeam(id, req.body);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(team);
  } catch (error: any) {
    console.error("Error updating team:", error);
    const message = error.message || "Error updating team";
    res.status(400).json({ message });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await teamService.deleteTeam(id);
    if (!deleted) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting team", error });
  }
};

export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { employeeId } = req.body;
    const member = await teamService.addTeamMember(teamId, employeeId);
    res.status(201).json(member);
  } catch (error: any) {
    console.error("Error adding team member:", error);
    const message = error.message || "Error adding team member";
    res.status(400).json({ message });
  }
};

export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const { teamId, employeeId } = req.params;
    const removed = await teamService.removeTeamMember(teamId, employeeId);
    if (!removed) {
      return res.status(404).json({ message: "Team member not found" });
    }
    res.json({ message: "Team member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing team member", error });
  }
};

export const getTeamByLeader = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { leaderId } = req.params;
    
    // Team leaders can only access their own team
    if (authReq.user?.role === "TEAM_LEADER") {
      const employee = await teamService.getEmployeeByUserId(authReq.user.id);
      if (!employee || employee.id !== leaderId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    const team = await teamService.getTeamByLeader(leaderId);
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team by leader", error });
  }
};

export const getAvailableEmployees = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { teamId } = req.params;
    
    // For admins, get all available employees
    if (authReq.user?.role === "ADMIN") {
      const employees = await teamService.getAvailableEmployeesForTeam(teamId);
      res.json(employees);
    } else {
      // For team leaders, restrict to their team's available employees
      const employee = await teamService.getEmployeeByUserId(authReq.user!.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const employees = await teamService.getAvailableEmployeesForTeam(teamId, employee.id);
      res.json(employees);
    }
  } catch (error) {
    console.error("Error fetching available employees:", error);
    res.status(500).json({ message: "Error fetching available employees", error });
  }
};