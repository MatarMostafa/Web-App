export interface SubAccount {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
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
  username: string;
  password: string;
  email?: string;
}

export interface UpdateSubAccountData {
  name?: string;
  email?: string;
  isActive?: boolean;
}