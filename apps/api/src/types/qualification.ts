export interface Qualification {
  id: string;
  employeeId: string;
  qualificationId: string;
  acquiredDate: string;
  expiryDate?: string;
  certificateUrl?: string;
  isVerified: boolean;
  proficiencyLevel: number;
}
