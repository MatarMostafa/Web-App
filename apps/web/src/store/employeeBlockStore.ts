import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

interface EmployeeBlockState {
  loading: boolean;
  error: string | null;
  
  blockEmployee: (userId: string, reason: string) => Promise<void>;
  unblockEmployee: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeBlockStore = create<EmployeeBlockState>((set) => ({
  loading: false,
  error: null,

  blockEmployee: async (userId: string, reason: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post("/api/employees-status/block", { userId, reason });
      toast.success("Employee blocked successfully");
      set({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to block employee";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  unblockEmployee: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post("/api/employees-status/unblock", { userId });
      toast.success("Employee unblocked successfully");
      set({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to unblock employee";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));