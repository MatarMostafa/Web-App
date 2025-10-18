// src/types/employee.ts
import { Absence } from "./absence";
import { Qualification } from "./qualification";
import { Assignment } from "./assignment";
import { Rating } from "./rating";
import { WorkStatistic } from "./workStatistics";
import { OrderAssignment } from "./order";
import { WorkScheduleType } from "./enums";
import { SickNotes } from "./sickNotes";

export interface Employee {
  id: string;
  employeeCode: string;

  // Personal Information
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string; // Date as ISO string for frontend
  address?: string;
  emergencyContact?: Record<string, any>; // flexible JSON structure

  // Employment Details
  hireDate: string; // ISO string
  terminationDate?: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  subordinates?: Employee[]; // recursive relation

  // Work Details
  scheduleType: WorkScheduleType;
  hourlyRate?: number;
  salary?: number;
  isAvailable: boolean;
  priority: number;

  // Relations
  userId: string;
  qualifications?: Qualification[];
  assignments?: Assignment[];
  absences?: Absence[];
  ratings?: Rating[];
  workStatistics?: WorkStatistic[];
  orderAssignments?: OrderAssignment[];

  // UI-specific optional fields (from your old interface)
  gesperrtFuer?: string[];
  category?: string;

  // Audit fields
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;

  // Additional optional arrays for compatibility
  sickNotes?: SickNotes[];
}
