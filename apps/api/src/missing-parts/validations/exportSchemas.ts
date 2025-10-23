import { z } from "zod";
import { OrderStatus, AssignmentStatus } from "../generated/prisma";

// Orders export schema
export const exportOrdersSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    customerId: z.string().optional(),
    departmentId: z.string().optional()
  }).optional()
});

// Employee performance export schema
export const exportEmployeePerformanceSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    departmentId: z.string().optional(),
    trafficLight: z.enum(["RED", "YELLOW", "GREEN"]).optional(),
    minPerformanceScore: z.coerce.number().min(0).max(100).optional()
  }).optional()
});

// Assignment details export schema
export const exportAssignmentDetailsSchema = z.object({
  params: z.object({
    orderId: z.string().optional()
  }).optional(),
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.nativeEnum(AssignmentStatus).optional(),
    tier: z.enum(["PRIMARY", "BACKUP", "FALLBACK"]).optional(),
    employeeId: z.string().optional()
  }).optional()
});

// Customer analytics export schema
export const exportCustomerAnalyticsSchema = z.object({
  params: z.object({
    customerId: z.string().optional()
  }).optional(),
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
  }).optional()
});

// Employee qualifications export schema
export const exportEmployeeQualificationsSchema = z.object({
  query: z.object({
    departmentId: z.string().optional(),
    qualificationId: z.string().optional(),
    expiringWithinDays: z.coerce.number().int().positive().optional()
  }).optional()
});

// Work statistics export schema
export const exportWorkStatisticsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    employeeId: z.string().optional(),
    departmentId: z.string().optional()
  }).optional()
});