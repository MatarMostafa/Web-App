import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

export interface CustomerTemplate {
  id: string;
  customerId: string;
  templateLines: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface OrderDescriptionData {
  id: string;
  orderId: string;
  descriptionData: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface TemplateState {
  customerTemplate: CustomerTemplate | null;
  orderDescriptionData: OrderDescriptionData | null;
  loading: boolean;
  error: string | null;

  // Customer Template Methods
  fetchCustomerTemplate: (customerId: string) => Promise<void>;
  createCustomerTemplate: (customerId: string, templateLines: string[]) => Promise<void>;
  updateCustomerTemplate: (customerId: string, templateLines: string[]) => Promise<void>;
  deleteCustomerTemplate: (customerId: string) => Promise<void>;

  // Order Description Data Methods
  fetchOrderDescriptionData: (orderId: string) => Promise<void>;
  createOrderDescriptionData: (orderId: string, descriptionData: Record<string, string>) => Promise<void>;
  updateOrderDescriptionData: (orderId: string, descriptionData: Record<string, string>) => Promise<void>;

  clearError: () => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  customerTemplate: null,
  orderDescriptionData: null,
  loading: false,
  error: null,

  fetchCustomerTemplate: async (customerId: string) => {
    set({ loading: true, error: null });
    try {
      // Custom fetch without toast for 404
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/api/customers/${customerId}/description-template`, {
        method: "GET",
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          set({ customerTemplate: data.data, loading: false });
        } else {
          set({ customerTemplate: null, loading: false });
        }
      } else if (response.status === 404) {
        // 404 is expected when no template exists - don't show error
        set({ customerTemplate: null, loading: false });
      } else {
        // Other errors should be shown
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch template" }));
        const errorMessage = errorData.message || "Failed to fetch template";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch template";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  createCustomerTemplate: async (customerId: string, templateLines: string[]) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<{ success: boolean; data: CustomerTemplate }>(
        `/api/customers/${customerId}/description-template`,
        { templateLines }
      );
      if (response.success) {
        set({ customerTemplate: response.data, loading: false });
        toast.success("Template created successfully");
      } else {
        throw new Error("Failed to create template");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create template";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateCustomerTemplate: async (customerId: string, templateLines: string[]) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<{ success: boolean; data: CustomerTemplate }>(
        `/api/customers/${customerId}/description-template`,
        { templateLines }
      );
      if (response.success) {
        set({ customerTemplate: response.data, loading: false });
        toast.success("Template updated successfully");
      } else {
        throw new Error("Failed to update template");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update template";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteCustomerTemplate: async (customerId: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/customers/${customerId}/description-template`);
      set({ customerTemplate: null, loading: false });
      toast.success("Template deleted successfully");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete template";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  fetchOrderDescriptionData: async (orderId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{ success: boolean; data: OrderDescriptionData }>(
        `/api/orders/${orderId}/description-data`
      );
      if (response.success) {
        set({ orderDescriptionData: response.data, loading: false });
      } else {
        set({ orderDescriptionData: null, loading: false });
      }
    } catch (error: any) {
      if (error.status === 404) {
        set({ orderDescriptionData: null, loading: false });
      } else {
        const errorMessage = error.message || "Failed to fetch order description data";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
      }
    }
  },

  createOrderDescriptionData: async (orderId: string, descriptionData: Record<string, string>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<{ success: boolean; data: OrderDescriptionData }>(
        `/api/orders/${orderId}/description-data`,
        { descriptionData }
      );
      if (response.success) {
        set({ orderDescriptionData: response.data, loading: false });
        toast.success("Order description saved successfully");
      } else {
        throw new Error("Failed to save order description");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to save order description";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateOrderDescriptionData: async (orderId: string, descriptionData: Record<string, string>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<{ success: boolean; data: OrderDescriptionData }>(
        `/api/orders/${orderId}/description-data`,
        { descriptionData }
      );
      if (response.success) {
        set({ orderDescriptionData: response.data, loading: false });
        toast.success("Order description updated successfully");
      } else {
        throw new Error("Failed to update order description");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update order description";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));