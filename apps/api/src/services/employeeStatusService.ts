// src/services/employeeStatusService.ts
import { prisma } from "@repo/db";

/**
 * Creates an Absence record for a user (employee found by userId)
 */
export const createAbsence = async (opts: {
  employeeUserId: string;
  type: "VACATION" | "SICK_LEAVE" | string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  documentUrls?: string[];
  requestedBy?: string | null;
}) => {
  const employee = await prisma.employee.findUnique({
    where: { userId: opts.employeeUserId },
  });
  if (!employee) throw new Error("Employee not found");

  // Check for overlapping absences
  const overlapping = await prisma.absence.findFirst({
    where: {
      employeeId: employee.id,
      startDate: { lte: opts.endDate },
      endDate: { gte: opts.startDate },
    },
  });
  if (overlapping)
    throw new Error("Absence dates overlap with existing absence");

  const absence = await prisma.absence.create({
    data: {
      employeeId: employee.id,
      type: opts.type as any,
      startDate: opts.startDate,
      endDate: opts.endDate,
      reason: opts.reason || "",
      status: "PENDING",
      documentUrls: opts.documentUrls || [],
    },
  });

  await prisma.auditLog.create({
    data: {
      tableName: "absences",
      recordId: absence.id,
      action: "CREATE",
      oldData: undefined,
      newData: {
        employeeId: employee.id,
        type: opts.type,
        startDate: absence.startDate,
        endDate: absence.endDate,
      },
      userId: opts.requestedBy || null,
    },
  });

  return absence;
};

/**
 * Find employees who are blocked (isAvailable = false)
 */
export const getBlockedEmployees = async () => {
  const blocked = await prisma.employee.findMany({
    where: { isAvailable: false },
    include: { user: true, department: true, position: true },
  });

  return blocked.map((e: any) => ({
    id: e.id,
    userId: e.userId,
    employeeCode: e.employeeCode,
    name: `${e.firstName} ${e.lastName}`,
    department: e.department?.name || null,
    position: e.position?.title || null,
    isAvailable: e.isAvailable,
    blockedAt: e.blockedAt,
    blockedReason: e.blockedReason,
    updatedAt: e.updatedAt,
  }));
};

export const blockEmployee = async (
  userId: string,
  reason: string,
  actedByUserId?: string | null
) => {
  const employee = await prisma.employee.findUnique({
    where: { userId },
  });
  if (!employee) return null;
  console.log("blockedReason = ", reason);
  const oldData = {
    id: employee.id,
    isAvailable: employee.isAvailable,
    blockedAt: employee.blockedAt,
    blockedReason: employee.blockedReason,
  };

  const updated = await prisma.employee.update({
    where: { id: employee.id },
    data: {
      isAvailable: false,
      blockedAt: new Date(),
      blockedReason: reason,
      updatedBy: actedByUserId || undefined,
    },
    include: { user: true, department: true, position: true },
  });

  await prisma.auditLog.create({
    data: {
      tableName: "employees",
      recordId: updated.id,
      action: "BLOCK",
      oldData,
      newData: {
        id: updated.id,
        isAvailable: updated.isAvailable,
        blockedAt: updated.blockedAt,
        blockedReason: updated.blockedReason,
      },
      userId: actedByUserId || null,
    },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    employeeCode: updated.employeeCode,
    name: `${updated.firstName} ${updated.lastName}`,
    isAvailable: updated.isAvailable,
    blockedAt: updated.blockedAt,
    blockedReason: updated.blockedReason,
    department: updated.department?.name || null,
    position: updated.position?.title || null,
    updatedAt: updated.updatedAt,
  };
};

export const unblockEmployee = async (
  userId: string,
  actedByUserId?: string | null
) => {
  const employee = await prisma.employee.findUnique({
    where: { userId },
  });
  if (!employee) return null;

  const oldData = {
    id: employee.id,
    isAvailable: employee.isAvailable,
    blockedAt: employee.blockedAt,
    blockedReason: employee.blockedReason,
  };

  const updated = await prisma.employee.update({
    where: { id: employee.id },
    data: {
      isAvailable: true,
      blockedAt: null,
      blockedReason: null,
      updatedBy: actedByUserId || undefined,
    },
    include: { user: true, department: true, position: true },
  });

  await prisma.auditLog.create({
    data: {
      tableName: "employees",
      recordId: updated.id,
      action: "UNBLOCK",
      oldData,
      newData: {
        id: updated.id,
        isAvailable: updated.isAvailable,
        blockedAt: updated.blockedAt,
        blockedReason: updated.blockedReason,
      },
      userId: actedByUserId || null,
    },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    employeeCode: updated.employeeCode,
    name: `${updated.firstName} ${updated.lastName}`,
    isAvailable: updated.isAvailable,
    blockedAt: updated.blockedAt,
    blockedReason: updated.blockedReason,
    department: updated.department?.name || null,
    position: updated.position?.title || null,
    updatedAt: updated.updatedAt,
  };
};

/**
 * Return all employees with their availability/status
 */
export const getAllEmployeeStatuses = async () => {
  const employees = await prisma.employee.findMany({
    include: { user: true, department: true, position: true },
    orderBy: { priority: "asc" },
  });

  return employees.map((e: any) => ({
    id: e.id,
    userId: e.userId,
    employeeCode: e.employeeCode,
    name: `${e.firstName} ${e.lastName}`,
    isAvailable: e.isAvailable,
    blockedAt: e.blockedAt,
    blockedReason: e.blockedReason,
    priority: e.priority,
    department: e.department?.name || null,
    position: e.position?.title || null,
    updatedAt: e.updatedAt,
  }));
};

export const getEmployeeStatusById = async (employeeId: string) => {
  const e = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: true, department: true, position: true },
  });
  if (!e) return null;

  return {
    id: e.id,
    userId: e.userId,
    employeeCode: e.employeeCode,
    name: `${e.firstName} ${e.lastName}`,
    isAvailable: e.isAvailable,
    blockedAt: e.blockedAt,
    blockedReason: e.blockedReason,
    priority: e.priority,
    department: e.department?.name || null,
    position: e.position?.title || null,
    updatedAt: e.updatedAt,
  };
};
