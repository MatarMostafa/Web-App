import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as employeeService from "../services/employeeService";

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error });
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
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const employee = await employeeService.getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee", error });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: "Error creating employee", error });
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
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const employee = await employeeService.updateEmployee(id, req.body);
    if (!employee) {
      return res.status(404).json({ message: "Update Error" });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: "Error updating employee", error });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await employeeService.deleteEmployee(id);

    if (!deleted) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error });
  }
};
