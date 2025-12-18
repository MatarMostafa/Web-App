import { Decimal } from 'decimal.js';

export interface ActivityDTO {
  id: string;
  name: string;
  code?: string;
  description?: string;
  defaultPrice: Decimal;
  unit: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerPriceDTO {
  id: string;
  customerId: string;
  activityId: string;
  price: Decimal;
  currency: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerPriceInput {
  activityId: string;
  price: number;
  currency?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive?: boolean;
}

export interface UpdateCustomerPriceInput {
  price?: number;
  currency?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  isActive?: boolean;
}

export interface CreateActivityInput {
  name: string;
  code?: string;
  description?: string;
  defaultPrice: number;
  unit?: string;
}

export interface PriceSnapshot {
  unit: string;
  unitPrice: Decimal;
  quantity: number;
  lineTotal: Decimal;
}
