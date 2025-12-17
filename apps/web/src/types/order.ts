export enum OrderStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  ACTIVE = "ACTIVE",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

export interface Order {
  id: string;
  orderNumber: string;
  description?: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number | null;
  location?: string;
  requiredEmployees: number;
  priority: number;
  specialInstructions?: string;
  status: OrderStatus;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateOrderData {
  orderNumber?: string;
  description?: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number | null;
  location?: string;
  requiredEmployees?: number;
  priority?: number;
  specialInstructions?: string;
  status?: OrderStatus;
  customerId: string;
  assignedEmployeeIds?: string[];
  qualifications?: Array<{
    qualificationId: string;
    activityId?: string;
    quantity?: number;
    required?: boolean;
  }>;
}

export interface UpdateOrderData {
  orderNumber?: string;
  description?: string;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: number | null;
  location?: string;
  requiredEmployees?: number;
  priority?: number;
  specialInstructions?: string;
  status?: OrderStatus;
  customerId?: string;
  assignedEmployeeIds?: string[];
}