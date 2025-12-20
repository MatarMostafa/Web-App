import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as employeeService from "../services/employeeService";
import * as employeeExportService from "../services/employeeExportService";

export const getAllEmployees = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userRole = authReq.user?.role;
    
    // Team leaders should not access all employees - redirect to team-specific endpoint
    if (userRole === "TEAM_LEADER") {
      return res.status(403).json({ 
        message: "Team leaders should use /team-leader/employees endpoint",
        redirectTo: "/team-leader/employees"
      });
    }
    
    const employees = await employeeService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Mitarbeiter", error });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const userRole = authReq.user?.role;
    const userId = authReq.user?.id;

    // Check if employee is accessing their own profile
    if (userRole === "EMPLOYEE") {
      const employee = await employeeService.getEmployeeById(userId as string);
      if (!employee || employee.id !== id) {
        return res.status(403).json({ message: "Zugriff verweigert" });
      }
    }

    const employee = await employeeService.getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen des Mitarbeiters", error });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const employee = await employeeService.createEmployee(req.body, authReq.user?.id);
    res.status(201).json(employee);
  } catch (error: any) {
    console.error("Error creating employee:", error);
    const message = error.message || "Error creating employee";
    res.status(400).json({ message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const userRole = authReq.user?.role;
    const userId = authReq.user?.id;

    // Check if employee is updating their own profile
    if (userRole === "EMPLOYEE") {
      const employee = await employeeService.getEmployeeById(userId as string);
      if (!employee || employee.id !== id) {
        return res.status(403).json({ message: "Zugriff verweigert" });
      }
    }

    const employee = await employeeService.updateEmployee(id, req.body);
    if (!employee) {
      return res.status(404).json({ message: "Aktualisierungsfehler" });
    }

    res.json(employee);
  } catch (error: any) {
    console.error("Error updating employee:", error);
    const message = error.message || "Error updating employee";
    res.status(400).json({ message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await employeeService.deleteEmployee(id);

    if (!deleted) {
      return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });
    }

    res.json({ message: "Mitarbeiter erfolgreich gelöscht" });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Löschen des Mitarbeiters", error });
  }
};

export const exportEmployeeAssignments = async (req: Request, res: Response) => {
  try {
    const { employeeId, period = 'monthly', startDate, endDate, format = 'xlsx' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

    const filters = {
      employeeId: employeeId as string,
      period: period as 'daily' | 'weekly' | 'monthly',
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      format: format as 'csv' | 'xlsx',
    };

    const exportData = await employeeExportService.exportEmployeeAssignments(filters);
    
    const fileExtension = format === 'csv' ? 'csv' : 'xlsx';
    const filename = `employee-assignments-${period}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: "Error exporting employee assignments", error });
  }
};

export const exportEmployeeWorkStats = async (req: Request, res: Response) => {
  try {
    const { employeeId, period = 'monthly', startDate, endDate, format = 'xlsx' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

    const filters = {
      employeeId: employeeId as string,
      period: period as 'daily' | 'weekly' | 'monthly',
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      format: format as 'csv' | 'xlsx',
    };

    const exportData = await employeeExportService.exportEmployeeWorkStatistics(filters);
    
    const fileExtension = format === 'csv' ? 'csv' : 'xlsx';
    const filename = `employee-work-stats-${period}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: "Error exporting work statistics", error });
  }
};

export const exportCombinedEmployeeData = async (req: Request, res: Response) => {
  try {
    const { employeeId, period = 'monthly', startDate, endDate, format = 'xlsx' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

    const filters = {
      employeeId: employeeId as string,
      period: period as 'daily' | 'weekly' | 'monthly',
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      format: format as 'csv' | 'xlsx',
    };

    const exportData = await employeeExportService.exportCombinedEmployeeData(filters);
    
    const fileExtension = format === 'csv' ? 'csv' : 'xlsx';
    const filename = `employee-combined-data-${period}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: "Error exporting combined employee data", error });
  }
};
