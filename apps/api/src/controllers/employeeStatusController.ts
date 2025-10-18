// src/controllers/employeeStatusController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as statusService from "../services/employeeStatusService";

export const requestLeave = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { startDate, endDate, reason } = req.body;
    const absence = await statusService.createAbsence({
      employeeUserId: userId,
      type: "VACATION",
      startDate,
      endDate,
      reason,
      requestedBy: userId,
    });

    res.status(201).json(absence);
  } catch (error: any) {
    res.status(400).json({
      message: "Error creating leave request",
      error: error.message || error,
    });
  }
};

export const sickReport = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { startDate, endDate, reason, documentUrls } = req.body;
    const absence = await statusService.createAbsence({
      employeeUserId: userId,
      type: "SICK_LEAVE",
      startDate,
      endDate,
      reason,
      documentUrls,
      requestedBy: userId,
    });

    res.status(201).json(absence);
  } catch (error: any) {
    res.status(400).json({
      message: "Error creating sick report",
      error: error.message || error,
    });
  }
};

export const getBlockStatus = async (_req: Request, res: Response) => {
  try {
    const blocked = await statusService.getBlockedEmployees();
    res.json(blocked);
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching block statuses",
      error: error.message || error,
    });
  }
};

export const blockEmployee = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { userId, reason } = req.body;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    if (!reason) return res.status(400).json({ message: "Missing reason" });

    const actingUserId = authReq.user?.id;
    const updated = await statusService.blockEmployee(
      userId,
      reason,
      actingUserId
    );

    if (!updated)
      return res
        .status(404)
        .json({ message: "Employee not found for given userId" });

    res.json({ message: "Employee blocked successfully", employee: updated });
  } catch (error: any) {
    res.status(500).json({
      message: "Error blocking employee",
      error: error.message || error,
    });
  }
};

export const unblockEmployee = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const actingUserId = authReq.user?.id;
    const updated = await statusService.unblockEmployee(userId, actingUserId);

    if (!updated)
      return res
        .status(404)
        .json({ message: "Employee not found for given userId" });

    res.json({ message: "Employee unblocked successfully", employee: updated });
  } catch (error: any) {
    res.status(500).json({
      message: "Error unblocking employee",
      error: error.message || error,
    });
  }
};

export const getAllStatuses = async (_req: Request, res: Response) => {
  try {
    const statuses = await statusService.getAllEmployeeStatuses();
    res.json(statuses);
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching employee statuses",
      error: error.message || error,
    });
  }
};

export const getStatusById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // employee id still used for this endpoint
    const status = await statusService.getEmployeeStatusById(id);
    if (!status) return res.status(404).json({ message: "Employee not found" });
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching status",
      error: error.message || error,
    });
  }
};
