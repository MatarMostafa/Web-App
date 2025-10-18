// src/types/sickNotes.ts
import { RequestStatus } from "./enums"; // match Prisma enum

export interface SickNotes {
  id: string;
  employeeId: string;

  // Sick leave details
  startDate: string; // ISO string
  endDate: string; // ISO string
  reason?: string;

  // Approval workflow
  status: RequestStatus; // PENDING | APPROVED | REJECTED | CANCELLED
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Supporting documents
  documentUrls: string[];

  // Audit fields
  createdAt: string;
  updatedAt: string;
}
