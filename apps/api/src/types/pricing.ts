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
