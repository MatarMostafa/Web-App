import { Request, Response } from "express";
import * as adminService from "../services/adminService";

export const getBlockedEmplyees = async (req: Request, res: Response) => {
  try {
    const blocks = await adminService.getBlockedEmplyees();
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Sperren", error });
  }
};

export const unblockEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;
    const result = await adminService.unblockEmployee(employeeId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Entsperren des Mitarbeiters", error });
  }
};

export const getCustomerStatistics = async (req: Request, res: Response) => {
  try {
    const statistics = await adminService.getCustomerStatistics();
    res.json(statistics);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fehler beim Abrufen der Kundenstatistiken", error });
  }
};

export const getAverageValues = async (req: Request, res: Response) => {
  try {
    const averages = await adminService.getAverageValues();
    res.json(averages);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Durchschnittswerte", error });
  }
};

export const hoursperEmployee = async (req: Request, res: Response) => {
  try {
    const hours = await adminService.getHoursPerEmployee();
    res.json(hours);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fehler beim Abrufen der Stunden pro Mitarbeiter", error });
  }
};

export const exportOrdersCSV = async (req: Request, res: Response) => {
  try {
    const csvData = await adminService.exportOrdersCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="orders.csv"');
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Exportieren der Aufträge als CSV", error });
  }
};

export const getDashboardStatistics = async (req: Request, res: Response) => {
  try {
    const statistics = await adminService.getDashboardStatistics();
    res.json(statistics);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fehler beim Abrufen der Dashboard-Statistiken", error });
  }
};
