import { Request, Response } from "express";
import * as performanceService from "../services/employeePerformanceService";

// List all employee performance records
export const listAll = async (req: Request, res: Response) => {
  try {
    const records = await performanceService.listAll();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Mitarbeiterleistungsaufzeichnungen", error });
  }
};

// Get single performance record by ID
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await performanceService.getById(id);

    if (!record) {
      return res.status(404).json({ message: "Leistungsnachweis nicht gefunden" });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen des Leistungsnachweises", error });
  }
};

// Get all performance history for one employee
export const getEmployeeHistory = async (req: Request, res: Response) => {
  try {
    const { id: employeeId } = req.params;
    const history = await performanceService.getEmployeeHistory(employeeId);

    res.json(history || []);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Mitarbeiterleistungshistorie", error });
  }
};

// Create a new performance evaluation
export const create = async (req: Request, res: Response) => {
  try {
    const record = await performanceService.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    console.error("Performance creation error:", error);
    res.status(400).json({ 
      message: "Fehler beim Erstellen des Leistungsnachweises", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Update a performance record
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await performanceService.update(id, req.body);

    if (!record) {
      return res.status(404).json({ message: "Leistungsnachweis nicht gefunden" });
    }

    res.json(record);
  } catch (error) {
    res.status(400).json({ message: "Fehler beim Aktualisieren des Leistungsnachweises", error });
  }
};

// Delete a performance record
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await performanceService.remove(id);

    if (!deleted) {
      return res.status(404).json({ message: "Leistungsnachweis nicht gefunden" });
    }

    res.json({ message: "Leistungsnachweis erfolgreich gelöscht" });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Löschen des Leistungsnachweises", error });
  }
};
