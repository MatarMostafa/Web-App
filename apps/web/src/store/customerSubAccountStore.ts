import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";
import { SubAccount, CreateSubAccountData, UpdateSubAccountData } from "@/types/subAccount";

interface CustomerSubAccountState {
  subAccounts: SubAccount[];
  loading: boolean;
  error: string | null;

  fetchSubAccounts: () => Promise<void>;
  createSubAccount: (data: CreateSubAccountData) => Promise<SubAccount>;
  updateSubAccount: (id: string, data: UpdateSubAccountData) => Promise<void>;
  deleteSubAccount: (id: string) => Promise<void>;
  resetSubAccountPassword: (id: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const useCustomerSubAccountStore = create<CustomerSubAccountState>((set, get) => ({
  subAccounts: [],
  loading: false,
  error: null,

  fetchSubAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{ success: boolean; data: SubAccount[] }>("/api/sub-accounts");
      if (response.success) {
        set({ subAccounts: response.data, loading: false });
      } else {
        set({ subAccounts: [], loading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch sub-accounts";
      set({ error: errorMessage, loading: false, subAccounts: [] });
      toast.error(errorMessage);
    }
  },

  createSubAccount: async (data: CreateSubAccountData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: SubAccount;
      }>("/api/sub-accounts", data);
      
      if (response.success) {
        set(state => ({
          subAccounts: [...state.subAccounts, response.data],
          loading: false
        }));
        return response.data;
      } else {
        throw new Error("FAILED_TO_CREATE");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "FAILED_TO_CREATE";
      console.log('Store error message:', errorMessage);
      set({ error: errorMessage, loading: false });
      throw error; // Throw the original error, not a new one
    }
  },

  updateSubAccount: async (id: string, data: UpdateSubAccountData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<{ success: boolean; data: SubAccount }>(`/api/sub-accounts/${id}`, data);
      
      if (response.success) {
        set(state => ({
          subAccounts: state.subAccounts.map(subAccount =>
            subAccount.id === id ? response.data : subAccount
          ),
          loading: false
        }));
        toast.success("Sub-account updated successfully!");
      } else {
        throw new Error("Failed to update sub-account");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update sub-account";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteSubAccount: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/sub-accounts/${id}`);
      set(state => ({
        subAccounts: state.subAccounts.filter(subAccount => subAccount.id !== id),
        loading: false
      }));
      toast.success("Sub-account deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete sub-account";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  resetSubAccountPassword: async (id: string, newPassword: string) => {
    try {
      await apiClient.put(`/api/sub-accounts/${id}/reset-password`, {
        newPassword,
      });
      toast.success("Password reset successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password";
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));