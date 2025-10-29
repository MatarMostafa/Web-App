export interface Employee {
  id: string;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: Record<string, any>;
  hireDate: string;
  terminationDate?: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionTitle?: string;
  managerId?: string;
  scheduleType: WorkScheduleType;
  hourlyRate?: number;
  salary?: number;
  isAvailable: boolean;
  priority: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export enum WorkScheduleType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  TEMPORARY = "TEMPORARY",
  INTERN = "INTERN",
}

export interface CreateEmployeeData {
  email?: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: Record<string, any>;
  hireDate?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  scheduleType?: WorkScheduleType;
  hourlyRate?: number;
  salary?: number;
}

export interface UpdateEmployeeData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: Record<string, any>;
  hireDate?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  scheduleType?: WorkScheduleType;
  hourlyRate?: number;
  salary?: number;
  isAvailable?: boolean;
  priority?: number;
}