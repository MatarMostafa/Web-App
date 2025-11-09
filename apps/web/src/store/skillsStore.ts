import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import { Qualification, EmployeeQualification, CreateEmployeeQualificationData, UpdateEmployeeQualificationData, CreateQualificationData, UpdateQualificationData } from "@/types/skills";
import toast from "react-hot-toast";

interface SkillsState {
  qualifications: Qualification[];
  allQualifications: Qualification[];
  employeeQualifications: EmployeeQualification[];
  categories: string[];
  loading: boolean;
  error: string | null;
  
  fetchQualifications: () => Promise<void>;
  fetchAllQualifications: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createQualification: (data: CreateQualificationData) => Promise<void>;
  updateQualification: (id: string, data: UpdateQualificationData) => Promise<void>;
  deleteQualification: (id: string) => Promise<void>;
  fetchEmployeeQualifications: () => Promise<void>;
  addEmployeeQualification: (data: CreateEmployeeQualificationData) => Promise<void>;
  updateEmployeeQualification: (employeeId: string, qualificationId: string, data: UpdateEmployeeQualificationData) => Promise<void>;
  removeEmployeeQualification: (qualificationId: string) => Promise<void>;
  addEmployeeQualificationAsAdmin: (employeeId: string, data: CreateEmployeeQualificationData) => Promise<void>;
  removeEmployeeQualificationAsAdmin: (employeeId: string, qualificationId: string) => Promise<void>;
  approveEmployeeQualification: (employeeId: string, qualificationId: string) => Promise<void>;
  rejectEmployeeQualification: (employeeId: string, qualificationId: string, reason?: string) => Promise<void>;
  clearError: () => void;
}

export const useSkillsStore = create<SkillsState>((set, get) => ({
  qualifications: [],
  allQualifications: [],
  employeeQualifications: [],
  categories: [],
  loading: false,
  error: null,

  fetchQualifications: async () => {
    set({ loading: true, error: null });
    try {
      const qualifications = await apiClient.get<Qualification[]>("/api/qualifications");
      set({ qualifications, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch qualifications";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchEmployeeQualifications: async () => {
    set({ loading: true, error: null });
    try {
      const employeeQualifications = await apiClient.get<EmployeeQualification[]>(`/api/qualifications/my-qualifications`);
      set({ employeeQualifications, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch employee qualifications";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  addEmployeeQualification: async (data: CreateEmployeeQualificationData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<{ qualification: EmployeeQualification }>(`/api/qualifications/my-qualifications`, data);
      set(state => ({ 
        employeeQualifications: [...state.employeeQualifications, response.qualification], 
        loading: false 
      }));
      toast.success("Skill added successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to add qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  removeEmployeeQualification: async (qualificationId: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/qualifications/my-qualifications/${qualificationId}`);
      set(state => ({
        employeeQualifications: state.employeeQualifications.filter(eq => eq.qualificationId !== qualificationId),
        loading: false
      }));
      toast.success("Skill removed successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to remove qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  addEmployeeQualificationAsAdmin: async (employeeId: string, data: CreateEmployeeQualificationData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<{ qualification: EmployeeQualification }>(`/api/qualifications/employee/${employeeId}`, data);
      set(state => ({ 
        employeeQualifications: [...state.employeeQualifications, response.qualification], 
        loading: false 
      }));
      toast.success("Fähigkeit erfolgreich hinzugefügt");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to add qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  removeEmployeeQualificationAsAdmin: async (employeeId: string, qualificationId: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/qualifications/employee/${employeeId}/${qualificationId}`);
      set(state => ({
        employeeQualifications: state.employeeQualifications.filter(eq => eq.qualificationId !== qualificationId),
        loading: false
      }));
      toast.success("Fähigkeit erfolgreich entfernt");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to remove qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  updateEmployeeQualification: async (employeeId: string, qualificationId: string, data: UpdateEmployeeQualificationData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<{ qualification: EmployeeQualification }>(`/api/qualifications/employee/${employeeId}/${qualificationId}`, data);
      set(state => ({
        employeeQualifications: state.employeeQualifications.map(eq => 
          eq.qualificationId === qualificationId ? response.qualification : eq
        ),
        loading: false
      }));
      toast.success("Skill updated successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  approveEmployeeQualification: async (employeeId: string, qualificationId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<{ qualification: EmployeeQualification }>(`/api/qualifications/employee/${employeeId}/${qualificationId}/approve`, {});
      set(state => ({
        employeeQualifications: state.employeeQualifications.map(eq => 
          eq.qualificationId === qualificationId ? response.qualification : eq
        ),
        loading: false
      }));
      toast.success("Skill approved successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to approve qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  rejectEmployeeQualification: async (employeeId: string, qualificationId: string, reason?: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.put(`/api/qualifications/employee/${employeeId}/${qualificationId}/reject`, { rejectionReason: reason });
      set(state => ({
        employeeQualifications: state.employeeQualifications.filter(eq => eq.qualificationId !== qualificationId),
        loading: false
      }));
      toast.success("Skill rejected and removed");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to reject qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchAllQualifications: async () => {
    set({ loading: true, error: null });
    try {
      const qualifications = await apiClient.get<Qualification[]>("/api/qualifications/admin/all");
      set({ allQualifications: qualifications, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch all qualifications";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await apiClient.get<string[]>("/api/qualifications/admin/categories");
      set({ categories });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },

  createQualification: async (data: CreateQualificationData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<{ qualification: Qualification }>("/api/qualifications/admin", data);
      set(state => ({
        allQualifications: [...state.allQualifications, response.qualification],
        loading: false
      }));
      toast.success("Qualifikation erfolgreich erstellt");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  updateQualification: async (id: string, data: UpdateQualificationData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<{ qualification: Qualification }>(`/api/qualifications/admin/${id}`, data);
      set(state => ({
        allQualifications: state.allQualifications.map(q => q.id === id ? response.qualification : q),
        loading: false
      }));
      toast.success("Qualifikation erfolgreich aktualisiert");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  deleteQualification: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/qualifications/admin/${id}`);
      set(state => ({
        allQualifications: state.allQualifications.filter(q => q.id !== id),
        loading: false
      }));
      toast.success("Qualifikation erfolgreich gelöscht");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete qualification";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));