// src/types/enums.ts

// ===============================
// USER & ROLES
// ===============================
export enum UserRole {
  ADMIN = "ADMIN",
  TEAM_LEADER = "TEAM_LEADER",
  EMPLOYEE = "EMPLOYEE",
  HR_MANAGER = "HR_MANAGER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

// ===============================
// PERFORMANCE & RATINGS
// ===============================
export enum RatingStatus {
  EXCELLENT = "EXCELLENT", // green
  GOOD = "GOOD", // yellow
  NEEDS_IMPROVEMENT = "NEEDS_IMPROVEMENT", // red
}

// ===============================
// ORDER MANAGEMENT
// ===============================
export enum OrderStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  ACTIVE = "ACTIVE",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

// ===============================
// REQUEST & APPROVAL WORKFLOWS
// ===============================
export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

// ===============================
// ASSIGNMENTS
// ===============================
export enum AssignmentStatus {
  ASSIGNED = "ASSIGNED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  OVERDUE = "OVERDUE",
}

// ===============================
// ABSENCE TYPES
// ===============================
export enum AbsenceType {
  SICK_LEAVE = "SICK_LEAVE",
  VACATION = "VACATION",
  PERSONAL_LEAVE = "PERSONAL_LEAVE",
  MATERNITY_LEAVE = "MATERNITY_LEAVE",
  PATERNITY_LEAVE = "PATERNITY_LEAVE",
  UNPAID_LEAVE = "UNPAID_LEAVE",
  BEREAVEMENT_LEAVE = "BEREAVEMENT_LEAVE",
  OTHER = "OTHER",
}

// ===============================
// WORK SCHEDULES
// ===============================
export enum WorkScheduleType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  TEMPORARY = "TEMPORARY",
  INTERN = "INTERN",
}
