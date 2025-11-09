// src/services/leaveService.ts
import { prisma } from "@repo/db";
import { notifyLeaveRequested, notifyLeaveApproved, notifyLeaveRejected } from "./notificationHelpers";

// Placeholder leave service - implement when leave system is built
export const createLeaveRequest = async (data: {
  employeeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  type?: string;
}, createdBy?: string) => {
  // This is a placeholder - implement actual leave creation when leave system exists
  const leaveId = `leave_${Date.now()}`;
  
  // Send notification to admins
  await notifyLeaveRequested(leaveId, data.employeeId, data.type || 'VACATION', data.startDate, data.endDate, data.reason, createdBy);
  
  return { id: leaveId, ...data, status: "PENDING" };
};

export const approveLeaveRequest = async (leaveId: string, employeeId: string, createdBy?: string) => {
  // This is a placeholder - implement actual leave approval when leave system exists
  
  // Send notification to employee
  await notifyLeaveApproved(leaveId, employeeId, createdBy);
  
  return { id: leaveId, status: "APPROVED" };
};

export const rejectLeaveRequest = async (leaveId: string, employeeId: string, reason?: string, createdBy?: string) => {
  // This is a placeholder - implement actual leave rejection when leave system exists
  
  // Send notification to employee
  await notifyLeaveRejected(leaveId, employeeId, reason, createdBy);
  
  return { id: leaveId, status: "REJECTED", reason };
};