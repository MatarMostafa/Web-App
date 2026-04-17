import { Decimal } from 'decimal.js';

export enum ActivityType {
  CONTAINER_UNLOADING = 'CONTAINER_UNLOADING',
  CONTAINER_LOADING = 'CONTAINER_LOADING',
  WRAPPING = 'WRAPPING',
  REPACKING = 'REPACKING',
  CROSSING = 'CROSSING',
  LABELING = 'LABELING',
  OTHER = 'OTHER'
}

export interface ActivityDTO {
  id: string;
  name: string;
  type: ActivityType;
  code?: string;
  description?: string;
  unit: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerPriceTierDTO {
  id: string;
  customerId: string;
  activityId: string;
  minQuantity: number;
  maxQuantity: number;
  price: Decimal;
  currency: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerPriceTierInput {
  activityId: string;
  minQuantity: number;
  maxQuantity: number;
  price: number;
  currency?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive?: boolean;
}

export interface UpdateCustomerPriceTierInput {
  minQuantity?: number;
  maxQuantity?: number;
  price?: number;
  currency?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  isActive?: boolean;
}

export interface CreateActivityInput {
  name: string;
  type: ActivityType;
  code?: string;
  description?: string;
  unit?: string;
}

export interface PriceSnapshot {
  unit: string;
  unitPrice: Decimal;
  quantity: number;
  lineTotal: Decimal;
}

// ==============================
// Pricing Method Types
// ==============================

export enum PricingMethod {
  HOURLY = 'HOURLY',
  PER_CARTON = 'PER_CARTON',
  PER_PIECE = 'PER_PIECE',
  QUANTITY = 'QUANTITY'
}

export interface CustomerPricingRuleDTO {
  id: string;
  customerId: string;
  customerActivityId?: string | null;
  method: PricingMethod;
  hourlyRate?: number | null;
  cartonRate?: number | null;
  articleRate?: number | null;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  createdBy?: string | null;
  customerActivity?: { id: string; name: string; type: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerPricingRuleInput {
  customerActivityId?: string;
  method: PricingMethod;
  hourlyRate?: number;
  cartonRate?: number;
  articleRate?: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateCustomerPricingRuleInput {
  hourlyRate?: number;
  cartonRate?: number;
  articleRate?: number;
  effectiveTo?: string;
  isActive?: boolean;
}

export interface BillingLineItemDTO {
  id: string;
  customerId: string;
  orderId: string;
  assignmentId?: string | null;
  containerEmployeeId?: string | null;
  method: PricingMethod;
  quantity: number;
  rate: number;
  lineTotal: number;
  currency: string;
  computedAt: Date;
  assignment?: {
    id: string;
    employeeId: string;
    employee?: { firstName?: string | null; lastName?: string | null };
  } | null;
  containerEmployee?: {
    id: string;
    employeeId: string;
    containerId: string;
  } | null;
}

export interface OrderBillingSummaryDTO {
  orderId: string;
  lineItems: BillingLineItemDTO[];
  totalByMethod: Record<PricingMethod, number>;
  grandTotal: number;
  currency: string;
}
