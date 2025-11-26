export interface Customer {
  id: string;
  companyName: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Record<string, any>;
  industry?: string;
  taxNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subAccounts?: SubAccount[];
  orders?: any[];
  ratings?: any[];
}

export interface SubAccount {
  id: string;
  customerId: string;
  name: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  companyName: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Record<string, any>;
  industry?: string;
  taxNumber?: string;
  isActive?: boolean;
  // Login credentials (optional)
  username?: string;
  password?: string;
}

export interface UpdateCustomerData {
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Record<string, any>;
  industry?: string;
  taxNumber?: string;
  isActive?: boolean;
}