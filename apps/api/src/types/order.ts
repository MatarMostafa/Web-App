// src/types/order.ts
import { Rating } from "../types";
import { Customer } from "./customer";

// -------------------- Enums --------------------

// Order status aligned with Prisma `OrderStatus` enum
export type OrderStatus =
  | "DRAFT"
  | "OPEN"
  | "ACTIVE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

// Assignment status aligned with Prisma `AssignmentStatus` enum
export type AssignmentStatus =
  | "ASSIGNED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "OVERDUE";

// Request status aligned with Prisma `RequestStatus` enum
export type RequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

// Rating status aligned with Prisma `RatingStatus` enum
export type RatingStatus = "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT";

// -------------------- Relations --------------------

// Basic order assignment (link between employee and order)
export interface OrderAssignment {
  id: string;
  orderId: string;
  employeeId: string;
  role?: string;
  hourlyRate?: number;
}

// Detailed assignment (tracks lifecycle of an employee on an order)
export interface Assignment {
  id: string;
  orderId?: string;
  employeeId: string;
  assignedDate: Date;
  startDate?: Date;
  endDate?: Date;
  status: AssignmentStatus;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
}

// OrderQualification (link between order and qualification)
export interface OrderQualification {
  id: string;
  orderId: string;
  qualificationId: string;
  required: boolean;
  minProficiency: number;
}

// -------------------- Main Order --------------------

export interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description?: string;

  scheduledDate: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  location?: string;

  requiredEmployees: number;
  priority: number;
  specialInstructions?: string;

  status: OrderStatus;
  startedAt?: Date;
  completedAt?: Date;

  customerId?: string;
  customer?: Customer;
  // subAccountId?: string; // optional: for future linking to sub-accounts

  qualifications?: OrderQualification[];
  orderAssignments?: OrderAssignment[];
  employeeAssignments?: Assignment[];
  ratings?: Rating[];

  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;

  // // -------------------- Optional Calculated Fields --------------------
  // totalAssignedEmployees?: number; // derived from assignments
  // completionRate?: number; // derived from ratings/assignments
}
