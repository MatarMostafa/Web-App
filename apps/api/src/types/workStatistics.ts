export interface WorkStatistic {
  id: string;
  date: string;
  employeeId: string;
  hoursWorked: number;
  overtimeHours: number;
  location?: string;
  projects: string[];
  efficiency?: number;
  qualityScore?: number;
}
