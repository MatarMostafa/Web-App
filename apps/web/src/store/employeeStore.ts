import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import { Employee, CreateEmployeeData, UpdateEmployeeData } from "@/types/employee";
import toast from "react-hot-toast";

interface Assignment {
  id: string;
  employeeId: string;
  orderId: string;
  assignedDate: string;
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
  assignments: Assignment[];
  employeeAssignments: Assignment[];
  loading: boolean;
  isLoadingEmployee: boolean;
  isLoadingAssignments: boolean;
  error: string | null;
  
  fetchEmployees: () => Promise<void>;
  fetchEmployee: (id: string) => Promise<void>;
  createEmployee: (data: CreateEmployeeData) => Promise<void>;
  updateEmployee: (id: string, data: UpdateEmployeeData) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  fetchEmployeeAssignments: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  currentEmployee: null,
  assignments: [],
  employeeAssignments: [],
  loading: false,
  isLoadingEmployee: false,
  isLoadingAssignments: false,
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

  fetchEmployeeAssignments: async (userId: string) => {
    set({ isLoadingAssignments: true, error: null });
    try {
      const assignments = await apiClient.get<Assignment[]>(`/api/employees/${userId}/assignments`);
      set({ employeeAssignments: assignments, isLoadingAssignments: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch assignments";
      set({ error: errorMessage, isLoadingAssignments: false });
      toast.error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));