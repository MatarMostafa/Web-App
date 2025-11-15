// src/services/performanceThresholdService.ts
import { prisma } from "@repo/db";
import {
  getDefaultThresholds,
  validateThresholds,
} from "../utils/performanceHelper";

// Get all thresholds (admin/HR only)
export const listAll = () => {
  return prisma.performanceThreshold.findMany({
    include: { department: true },
  });
};

// Get threshold config for one department
export const getByDepartment = (departmentId: string) => {
  return prisma.performanceThreshold.findUnique({
    where: { departmentId },
  });
};

// Create threshold config for a department
export const create = (departmentId: string, data: any) => {
  // Validate thresholds before creating
  const validation = validateThresholds(data);
  if (!validation.isValid) {
    throw new Error(`Ungültige Schwellenwerte: ${validation.errors.join(", ")}`);
  }

  return prisma.performanceThreshold.create({
    data: {
      ...data,
      departmentId,
    },
  });
};

// Update threshold config
export const update = (id: string, data: any) => {
  // Validate thresholds before updating
  const validation = validateThresholds(data);
  if (!validation.isValid) {
    throw new Error(`Ungültige Schwellenwerte: ${validation.errors.join(", ")}`);
  }

  return prisma.performanceThreshold.update({
    where: { id },
    data,
  });
};

// Delete threshold config
export const remove = (id: string) => {
  return prisma.performanceThreshold.delete({
    where: { id },
  });
};

// Initialize default thresholds for a department
export const initializeDefaultThresholds = async (departmentId: string) => {
  const existing = await getByDepartment(departmentId);
  if (existing) {
    return existing;
  }

  const defaultThresholds = getDefaultThresholds();
  return create(departmentId, defaultThresholds);
};

// Initialize default thresholds for all departments without them
export const initializeAllMissingThresholds = async () => {
  const departments = await prisma.department.findMany({
    where: {
      performanceThreshold: null,
    },
  });

  const results = [];
  for (const dept of departments) {
    try {
      const threshold = await initializeDefaultThresholds(dept.id);
      results.push({ departmentId: dept.id, success: true, threshold });
    } catch (error) {
      results.push({
        departmentId: dept.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
};
