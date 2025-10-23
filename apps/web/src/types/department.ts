export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}