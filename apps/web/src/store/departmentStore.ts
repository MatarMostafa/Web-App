import { create } from "zustand";
import { Department, CreateDepartmentData, UpdateDepartmentData } from "@/types/department";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

interface DepartmentState {
  departments: Department[];
  currentDepartment: Department | null;
  loading: boolean;
  isLoadingDepartment: boolean;
  error: string | null;
  
  // Actions
  fetchDepartments: () => Promise<void>;
  fetchDepartment: (id: string) => Promise<void>;
  createDepartment: (data: CreateDepartmentData) => Promise<void>;
  updateDepartment: (id: string, data: UpdateDepartmentData) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  updateDepartmentStatus: (id: string, isActive: boolean) => Promise<void>;
  clearError: () => void;
}

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departments: [],
  currentDepartment: null,
  loading: false,
  isLoadingDepartment: false,
  error: null,

  fetchDepartments: async () => {
    set({ loading: true, error: null });
    try {
      const departments = await apiClient.get<Department[]>("/api/departments");
      set({ departments, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch departments";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchDepartment: async (id: string) => {
    set({ isLoadingDepartment: true, error: null });
    try {
      const department = await apiClient.get<Department>(`/api/departments/${id}`);
      set({ currentDepartment: department, isLoadingDepartment: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch department", isLoadingDepartment: false });
    }
  },

  createDepartment: async (data: CreateDepartmentData) => {
    set({ loading: true, error: null });
    try {
      const newDepartment = await apiClient.post<Department>("/api/departments", data);
      set(state => ({ 
        departments: [...state.departments, newDepartment], 
        loading: false 
      }));
      toast.success("Department created successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to create department", loading: false });
      throw error;
    }
  },

  updateDepartment: async (id: string, data: UpdateDepartmentData) => {
    set({ loading: true, error: null });
    try {
      const updatedDepartment = await apiClient.put<Department>(`/api/departments/${id}`, data);
      set(state => ({
        departments: state.departments.map(dept => dept.id === id ? updatedDepartment : dept),
        loading: false
      }));
      toast.success("Department updated successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update department", loading: false });
      throw error;
    }
  },

  deleteDepartment: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/departments/${id}`);
      set(state => ({
        departments: state.departments.filter(dept => dept.id !== id),
        loading: false
      }));
      toast.success("Department deleted successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to delete department", loading: false });
      throw error;
    }
  },

  updateDepartmentStatus: async (id: string, isActive: boolean) => {
    set({ loading: true, error: null });
    try {
      const updatedDepartment = await apiClient.put<Department>(`/api/departments/${id}/status`, { isActive });
      set(state => ({
        departments: state.departments.map(dept => dept.id === id ? updatedDepartment : dept),
        loading: false
      }));
      toast.success(`Department ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update department status", loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));