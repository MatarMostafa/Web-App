export interface Qualification {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  requiresCertificate: boolean;
  expiryMonths?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeQualification {
  id: string;
  employeeId: string;
  qualificationId: string;
  acquiredDate: string;
  expiryDate?: string;
  certificateUrl?: string;
  isVerified: boolean;
  proficiencyLevel: number;
  createdAt: string;
  updatedAt: string;
  qualification: Qualification;
}

export interface CreateEmployeeQualificationData {
  qualificationId: string;
  proficiencyLevel: number;
  expiryDate?: string;
  certificateUrl?: string;
}

export interface UpdateEmployeeQualificationData {
  proficiencyLevel?: number;
  expiryDate?: string;
  certificateUrl?: string;
  isVerified?: boolean;
}

export enum QualificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED', 
  REJECTED = 'REJECTED'
}

export interface CreateQualificationData {
  name: string;
  description?: string;
  category: string;
}

export interface UpdateQualificationData {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}