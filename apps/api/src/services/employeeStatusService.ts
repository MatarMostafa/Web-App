// src/services/employeeStatusService.ts
import { prisma } from "@repo/db";
import { ensureEmployeeExists } from "../utils/employeeUtils";
import { notifyEmployeeBlocked, notifyEmployeeUnblocked, notifyLeaveRequested, notifyLeaveApproved, notifyLeaveRejected } from "./notificationHelpers";

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
  const employee = await ensureEmployeeExists(opts.employeeUserId);

  // Check for overlapping absences (exclude rejected ones)
  const overlapping = await prisma.absence.findFirst({
    where: {
      employeeId: employee.id,
      startDate: { lte: opts.endDate },
      endDate: { gte: opts.startDate },
      status: { not: "REJECTED" },
    },
  });
  if (overlapping) {
    throw new Error(`Leave request overlaps with existing ${overlapping.status.toLowerCase()} absence from ${overlapping.startDate.toDateString()} to ${overlapping.endDate.toDateString()}`);
  }

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

  // Send notification to admins about leave request
  await notifyLeaveRequested(absence.id, employee.id, opts.type, opts.startDate, opts.endDate, opts.reason, opts.requestedBy || undefined);

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
  const employee = await ensureEmployeeExists(userId);
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

  // Send notification to employee
  await notifyEmployeeBlocked(updated.id, reason, actedByUserId || undefined);

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
  const employee = await ensureEmployeeExists(userId);

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

  // Send notification to employee
  await notifyEmployeeUnblocked(updated.id, actedByUserId || undefined);

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

export const approveAbsence = async (absenceId: string, approvedBy: string) => {
  const absence = await prisma.absence.findUnique({
    where: { id: absenceId },
    include: { employee: { include: { user: true } } }
  });

  if (!absence) throw new Error("Absence not found");
  if (absence.status !== "PENDING") throw new Error("Absence is not pending");

  const updated = await prisma.absence.update({
    where: { id: absenceId },
    data: { status: "APPROVED" }
  });

  await prisma.auditLog.create({
    data: {
      tableName: "absences",
      recordId: absenceId,
      action: "APPROVE",
      oldData: { status: "PENDING" },
      newData: { status: "APPROVED" },
      userId: approvedBy
    }
  });

  // Send notification to employee
  await notifyLeaveApproved(absenceId, absence.employee.userId, approvedBy);

  return updated;
};

export const rejectAbsence = async (absenceId: string, reason: string, rejectedBy: string) => {
  const absence = await prisma.absence.findUnique({
    where: { id: absenceId },
    include: { employee: { include: { user: true } } }
  });

  if (!absence) throw new Error("Absence not found");
  if (absence.status !== "PENDING") throw new Error("Absence is not pending");

  const updated = await prisma.absence.update({
    where: { id: absenceId },
    data: { 
      status: "REJECTED",
      reason: reason
    }
  });

  await prisma.auditLog.create({
    data: {
      tableName: "absences",
      recordId: absenceId,
      action: "REJECT",
      oldData: { status: "PENDING" },
      newData: { status: "REJECTED", reason },
      userId: rejectedBy
    }
  });

  // Send notification to employee
  await notifyLeaveRejected(absenceId, absence.employee.userId, reason, rejectedBy);

  return updated;
};
