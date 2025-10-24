import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import { Employee, CreateEmployeeData, UpdateEmployeeData } from "@/types/employee";
import { getSession } from "next-auth/react";
import toast from "react-hot-toast";

interface EmployeeAssignment {
  id: string;
  orderId: string;
  assignedDate: string;
  startDate?: string;
  endDate?: string;
  status: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  order: {
    id: string;
    orderNumber: string;
    title: string;
    scheduledDate: string;
    status: string;
    priority: number;
  };
}

interface EmployeePerformance {
  id: string;
  periodStart: string;
  periodEnd: string;
  score: number;
  trafficLight: 'RED' | 'YELLOW' | 'GREEN';
  trafficLightReason?: string;
  metrics?: any;
  manualOverride: boolean;
  createdAt: string;
}

interface EmployeeQualification {
  id: string;
  acquiredDate: string;
  expiryDate?: string;
  certificateUrl?: string;
  isVerified: boolean;
  proficiencyLevel: number;
  qualification: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    requiresCertificate: boolean;
  };
}

interface EmployeeAbsence {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    department: { name: string };
    position: { title: string };
  };
}

interface EmployeeFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  documentType: string;
  description?: string;
  isVerified: boolean;
  createdAt: string;
}

interface EmployeeState {
  employees: Employee[];
  currentEmployee: Employee | null;
  employeeAssignments: EmployeeAssignment[];
  employeePerformance: EmployeePerformance[];
  employeeQualifications: EmployeeQualification[];
  employeeAbsences: EmployeeAbsence[];
  employeeFiles: EmployeeFile[];
  allAbsences: EmployeeAbsence[];
  loading: boolean;
  isLoadingEmployee: boolean;
  isLoadingAssignments: boolean;
  isLoadingPerformance: boolean;
  isLoadingQualifications: boolean;
  isLoadingAbsences: boolean;
  isLoadingFiles: boolean;
  error: string | null;
  
  fetchEmployees: () => Promise<void>;
  fetchEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Promise<Employee | null>;
  fetchEmployeeAssignments: (employeeId: string) => Promise<void>;
  fetchEmployeePerformance: (employeeId: string) => Promise<void>;
  fetchEmployeeQualifications: (employeeId: string) => Promise<void>;
  fetchEmployeeAbsences: (employeeId: string) => Promise<void>;
  fetchEmployeeFiles: (employeeId: string) => Promise<void>;
  downloadFile: (fileId: string, filename: string) => Promise<void>;
  previewFile: (fileId: string) => Promise<void>;
  fetchAllAbsences: (filters?: { status?: string; type?: string }) => Promise<void>;
  approveAbsence: (absenceId: string, reason?: string) => Promise<void>;
  rejectAbsence: (absenceId: string, reason?: string) => Promise<void>;
  createEmployee: (data: CreateEmployeeData) => Promise<void>;
  updateEmployee: (id: string, data: UpdateEmployeeData) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  currentEmployee: null,
  employeeAssignments: [],
  employeePerformance: [],
  employeeQualifications: [],
  employeeAbsences: [],
  employeeFiles: [],
  allAbsences: [],
  loading: false,
  isLoadingEmployee: false,
  isLoadingAssignments: false,
  isLoadingPerformance: false,
  isLoadingQualifications: false,
  isLoadingAbsences: false,
  isLoadingFiles: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const employees = await apiClient.get<Employee[]>("/api/employees");
      set({ employees, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch employees";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchEmployee: async (id: string) => {
    set({ isLoadingEmployee: true, error: null });
    try {
      const employee = await apiClient.get<Employee>(`/api/employees/${id}`);
      set({ currentEmployee: employee, isLoadingEmployee: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch employee";
      set({ error: errorMessage, isLoadingEmployee: false });
      toast.error(errorMessage);
    }
  },

  createEmployee: async (data: CreateEmployeeData) => {
    set({ loading: true, error: null });
    try {
      const newEmployee = await apiClient.post<Employee>("/api/employees", data);
      set(state => ({ 
        employees: [...state.employees, newEmployee], 
        loading: false 
      }));
      toast.success("Employee created successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to create employee", loading: false });
      throw error;
    }
  },

  updateEmployee: async (id: string, data: UpdateEmployeeData) => {
    set({ loading: true, error: null });
    try {
      const updatedEmployee = await apiClient.put<Employee>(`/api/employees/${id}`, data);
      set(state => ({
        employees: state.employees.map(emp => emp.id === id ? updatedEmployee : emp),
        loading: false
      }));
      toast.success("Employee updated successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update employee", loading: false });
      throw error;
    }
  },

  deleteEmployee: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/employees/${id}`);
      set(state => ({
        employees: state.employees.filter(emp => emp.id !== id),
        loading: false
      }));
      toast.success("Employee deleted successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to delete employee", loading: false });
      throw error;
    }
  },

  getEmployeeById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const employee = await apiClient.get<Employee>(`/api/employees/${id}`);
      set({ loading: false });
      return employee;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch employee", loading: false });
      return null;
    }
  },

  fetchEmployeeAssignments: async (employeeId: string) => {
    set({ isLoadingAssignments: true, error: null });
    try {
      const assignments = await apiClient.get<EmployeeAssignment[]>(`/api/employees/${employeeId}/assignments`);
      set({ employeeAssignments: assignments, isLoadingAssignments: false });
    } catch (error) {
      console.error('Error fetching employee assignments:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch assignments";
      set({ error: errorMessage, isLoadingAssignments: false });
      toast.error(errorMessage);
    }
  },

  fetchEmployeePerformance: async (employeeId: string) => {
    set({ isLoadingPerformance: true, error: null });
    try {
      const performance = await apiClient.get<EmployeePerformance[]>(`/api/performance/employees/${employeeId}/performance`);
      set({ employeePerformance: performance, isLoadingPerformance: false });
    } catch (error) {
      console.error('Error fetching employee performance:', error);
      set({ isLoadingPerformance: false, employeePerformance: [] });
    }
  },

  fetchEmployeeQualifications: async (employeeId: string) => {
    set({ isLoadingQualifications: true, error: null });
    try {
      const qualifications = await apiClient.get<EmployeeQualification[]>(`/api/qualifications/employee/${employeeId}`);
      set({ employeeQualifications: qualifications, isLoadingQualifications: false });
    } catch (error) {
      console.error('Error fetching employee qualifications:', error);
      set({ isLoadingQualifications: false, employeeQualifications: [] });
    }
  },

  fetchEmployeeAbsences: async (employeeId: string) => {
    set({ isLoadingAbsences: true, error: null });
    try {
      const absences = await apiClient.get<EmployeeAbsence[]>(`/api/employees/${employeeId}/absences`);
      set({ employeeAbsences: absences, isLoadingAbsences: false });
    } catch (error) {
      console.error('Error fetching employee absences:', error);
      set({ isLoadingAbsences: false, employeeAbsences: [] });
    }
  },

  fetchEmployeeFiles: async (employeeId: string) => {
    set({ isLoadingFiles: true, error: null });
    try {
      const files = await apiClient.get<EmployeeFile[]>(`/api/files/employee/${employeeId}`);
      set({ employeeFiles: files, isLoadingFiles: false });
    } catch (error) {
      console.error('Error fetching employee files:', error);
      set({ isLoadingFiles: false, employeeFiles: [] });
    }
  },

  downloadFile: async (fileId: string, filename: string) => {
    try {
      const session = await getSession();
      const headers: Record<string, string> = {};
      
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/files/${fileId}/download`, {
        method: "GET",
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  },

  previewFile: async (fileId: string) => {
    try {
      const session = await getSession();
      const headers: Record<string, string> = {};
      
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/files/${fileId}/preview`, {
        method: "GET",
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Preview failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up after a delay to allow the browser to load the file
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error previewing file:', error);
      toast.error('Failed to preview file');
    }
  },

  fetchAllAbsences: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      
      const absences = await apiClient.get<EmployeeAbsence[]>(`/api/absences?${params.toString()}`);
      set({ allAbsences: absences, loading: false });
    } catch (error) {
      console.error('Error fetching all absences:', error);
      set({ loading: false, allAbsences: [] });
    }
  },

  approveAbsence: async (absenceId: string, reason?: string) => {
    try {
      await apiClient.put(`/api/absences/${absenceId}/approve`, { 
        approvalReason: reason 
      });
      toast.success('Absence request approved successfully');
      
      // Refresh data
      const { fetchAllAbsences, fetchEmployeeAbsences, currentEmployee } = get();
      fetchAllAbsences();
      if (currentEmployee?.id) {
        fetchEmployeeAbsences(currentEmployee.id);
      }
    } catch (error) {
      console.error('Error approving absence:', error);
      toast.error('Failed to approve absence request');
    }
  },

  rejectAbsence: async (absenceId: string, reason?: string) => {
    try {
      await apiClient.put(`/api/absences/${absenceId}/reject`, { 
        rejectionReason: reason || 'No reason provided' 
      });
      toast.success('Absence request rejected successfully');
      
      // Refresh data
      const { fetchAllAbsences, fetchEmployeeAbsences, currentEmployee } = get();
      fetchAllAbsences();
      if (currentEmployee?.id) {
        fetchEmployeeAbsences(currentEmployee.id);
      }
    } catch (error) {
      console.error('Error rejecting absence:', error);
      toast.error('Failed to reject absence request');
    }
  },

  clearError: () => set({ error: null }),
}));