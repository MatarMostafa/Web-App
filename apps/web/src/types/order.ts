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

export enum ActivityType {
  CONTAINER_UNLOADING = 'CONTAINER_UNLOADING',
  CONTAINER_LOADING = 'CONTAINER_LOADING',
  WRAPPING = 'WRAPPING',
  REPACKING = 'REPACKING',
  CROSSING = 'CROSSING',
  LABELING = 'LABELING',
  OTHER = 'OTHER'
}

export interface DescriptionData {
  [key: string]: string;
}

export interface CustomerPriceTier {
  id: string;
  customerId: string;
  customerActivityId: string;
  minQuantity: number;
  maxQuantity: number;
  price: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  description?: string;
  descriptionData?: {
    descriptionData: DescriptionData;
  };
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number | null;
  location?: string;
  requiredEmployees: number;
  priority: number;
  specialInstructions?: string;
  status: OrderStatus;
  usesTemplate?: boolean;
  cartonQuantity?: number;
  articleQuantity?: number;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  customer?: {
    id: string;
    companyName: string;
  };
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
  activities?: Array<{
    activityId: string;
    quantity: number;
  }>;
  cartonQuantity?: number;
  articleQuantity?: number;
  templateData?: Record<string, string> | null;
  qualifications?: Array<{
    qualificationId: string;
    activityId?: string;
    quantity: number;
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
  activities?: Array<{
    activityId: string;
    quantity: number;
  }>;
  cartonQuantity?: number;
  articleQuantity?: number;
  templateData?: Record<string, string> | null;
}