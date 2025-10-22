import { create } from "zustand";
import { Employee, CreateEmployeeData, UpdateEmployeeData } from "@/types/employee";
import { apiClient } from "@/lib/api-client";
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

interface EmployeeState {
  employees: Employee[];
  currentEmployee: Employee | null;
  employeeAssignments: EmployeeAssignment[];
  loading: boolean;
  isLoadingEmployee: boolean;
  isLoadingAssignments: boolean;
  error: string | null;
  
  // Actions
  fetchEmployees: () => Promise<void>;
  fetchEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Promise<Employee | null>;
  fetchEmployeeAssignments: (employeeId: string) => Promise<void>;
  createEmployee: (data: CreateEmployeeData) => Promise<void>;
  updateEmployee: (id: string, data: UpdateEmployeeData) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  currentEmployee: null,
  employeeAssignments: [],
  loading: false,
  isLoadingEmployee: false,
  isLoadingAssignments: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching employees...');
      const employees = await apiClient.get<Employee[]>("/api/employees");
      console.log('Employees fetched successfully:', employees);
      set({ employees, loading: false });
    } catch (error) {
      console.error('Error fetching employees:', error);
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
      set({ error: error instanceof Error ? error.message : "Failed to fetch employee", isLoadingEmployee: false });
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

  fetchEmployeeAssignments: async (employeeId: string) => {
    set({ isLoadingAssignments: true, error: null });
    try {
      const assignments = await apiClient.get<EmployeeAssignment[]>(`/api/employees/${employeeId}/assignments`);
      set({ employeeAssignments: assignments, isLoadingAssignments: false });
    } catch (error) {
      console.error('Error fetching employee assignments:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch assignments";
      set({ error: errorMessage, isLoadingAssignments: false, employeeAssignments: [] });
    }
  },

  clearError: () => set({ error: null }),
}));