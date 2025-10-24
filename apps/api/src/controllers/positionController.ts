import { Request, Response } from "express";
import * as positionService from "../services/positionService";

export const getAllPositions = async (req: Request, res: Response) => {
  try {
    const positions = await positionService.getAllPositionsService();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching positions", error });
  }
};

export const getPositionById = async (req: Request, res: Response) => {
  try {
    const position = await positionService.getPositionByIdService(req.params.id);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json(position);
  } catch (error) {
    res.status(500).json({ message: "Error fetching position", error });
  }
};

export const createPosition = async (req: Request, res: Response) => {
  try {
    const { title, description, departmentId, isActive } = req.body;
    const position = await positionService.createPositionService({ title, description, departmentId, isActive });
    res.status(201).json(position);
  } catch (error) {
    res.status(400).json({ message: "Error creating position", error });
  }
};

export const updatePosition = async (req: Request, res: Response) => {
  try {
    const { title, description, departmentId, isActive } = req.body;
    const position = await positionService.updatePositionService(req.params.id, { title, description, departmentId, isActive });
    res.json(position);
  } catch (error) {
    res.status(400).json({ message: "Error updating position", error });
  }
};

export const deletePosition = async (req: Request, res: Response) => {
  try {
    const deletedPosition = await positionService.deletePositionService(req.params.id);
    res.json({ message: "Position deleted successfully", position: deletedPosition });
  } catch (error) {
    res.status(400).json({ message: "Error deleting position", error });
  }
};

export const updatePositionStatus = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const position = await positionService.updatePositionStatusService(req.params.id, isActive);
    res.json(position);
  } catch (error) {
    res.status(400).json({ message: "Error updating position status", error });
  }
};