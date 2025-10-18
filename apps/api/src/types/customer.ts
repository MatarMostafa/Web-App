// src/types/customer.ts
import { Order, Rating } from "../types";


// SubAccount type (linked to a Customer)
export interface SubAccount {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;

  customerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer type
export interface Customer {
  id: string;
  companyName: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Record<string, any>;
  isActive: boolean;

  industry?: string;
  taxNumber?: string;

  subAccounts?: SubAccount[];
  orders?: Order[];
  ratings?: Rating[];

  createdAt: Date;
  updatedAt: Date;
}
