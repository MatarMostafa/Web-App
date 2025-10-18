import { Request, Response } from "express";
import * as thresholdService from "../services/performanceThresholdService";

// Get all thresholds
export const listAll = async (req: Request, res: Response) => {
  try {
    const thresholds = await thresholdService.listAll();
    res.json(thresholds);
  } catch (error) {
    res.status(500).json({ message: "Error fetching performance thresholds", error });
  }
};

// Get threshold for one department
export const getByDepartment = async (req: Request, res: Response) => {
  try {
    const { id: departmentId } = req.params;
    const threshold = await thresholdService.getByDepartment(departmentId);

    if (!threshold) {
      return res.status(404).json({ message: "Threshold config not found" });
    }

    res.json(threshold);
  } catch (error) {
    res.status(500).json({ message: "Error fetching threshold config", error });
  }
};

// Create threshold config for department
export const create = async (req: Request, res: Response) => {
  try {
    const { id: departmentId } = req.params;
    const threshold = await thresholdService.create(departmentId, req.body);
    res.status(201).json(threshold);
  } catch (error) {
    res.status(400).json({ message: "Error creating threshold", error });
  }
};

// Update threshold config
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const threshold = await thresholdService.update(id, req.body);

    if (!threshold) {
      return res.status(404).json({ message: "Threshold not found" });
    }

    res.json(threshold);
  } catch (error) {
    res.status(400).json({ message: "Error updating threshold", error });
  }
};

// Delete threshold config
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await thresholdService.remove(id);

    if (!deleted) {
      return res.status(404).json({ message: "Threshold not found" });
    }

    res.json({ message: "Threshold deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting threshold", error });
  }
};

// Initialize default thresholds for all departments without them
export const initializeDefaults = async (req: Request, res: Response) => {
  try {
    const results = await thresholdService.initializeAllMissingThresholds();
    res.json({
      message: "Default thresholds initialization completed",
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error initializing default thresholds", error });
  }
};
