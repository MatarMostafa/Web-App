// src/types/assignment.ts

export interface Assignment {
  id: string;
  orderId?: string;
  employeeId: string;
  assignedDate: string;
  startDate?: string;
  endDate?: string;
  status: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
}
