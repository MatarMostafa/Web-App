import { Request, Response } from "express";
import * as departmentService from "../services/departmentService";

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await departmentService.getAllDepartmentsService();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments", error });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const department = await departmentService.getDepartmentByIdService(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: "Error fetching department", error });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, code, description, isActive } = req.body;
    const department = await departmentService.createDepartmentService({ name, code, description, isActive });
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: "Error creating department", error });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { name, code, description, isActive } = req.body;
    const department = await departmentService.updateDepartmentService(req.params.id, { name, code, description, isActive });
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: "Error updating department", error });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const deletedDepartment = await departmentService.deleteDepartmentService(req.params.id);
    res.json({ message: "Department deleted successfully", department: deletedDepartment });
  } catch (error) {
    res.status(400).json({ message: "Error deleting department", error });
  }
};

export const updateDepartmentStatus = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const department = await departmentService.updateDepartmentStatusService(req.params.id, isActive);
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: "Error updating department status", error });
  }
};