export interface Position {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  department?: {
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionData {
  title: string;
  description?: string;
  departmentId: string;
}

export interface UpdatePositionData {
  title?: string;
  description?: string;
  departmentId?: string;
  isActive?: boolean;
}