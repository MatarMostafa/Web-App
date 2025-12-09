export interface SubAccount {
  id: string;
  name: string;
  email: string;
  code?: string;
  isActive: boolean;
  canCreateOrders: boolean;
  canEditOrders: boolean;
  canViewReports: boolean;
  customerId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin?: string;
  };
  customer?: {
    id: string;
    companyName: string;
  };
}

export interface CreateSubAccountData {
  name: string;
  email: string;
  canCreateOrders?: boolean;
  canEditOrders?: boolean;
  canViewReports?: boolean;
}

export interface UpdateSubAccountData {
  name?: string;
  email?: string;
  canCreateOrders?: boolean;
  canEditOrders?: boolean;
  canViewReports?: boolean;
  isActive?: boolean;
}