import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import { Customer, CreateCustomerData, UpdateCustomerData } from "@/types/customer";
import toast from "react-hot-toast";

interface CustomerOrder {
  id: string;
  orderNumber: string;
  title?: string;
  description?: string;
  scheduledDate: string;
  location?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerProfile {
  id: string;
  companyName: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: any;
  industry?: string;
  user: {
    email?: string;
    username: string;
  };
}

interface CustomerState {
  // Customer portal state
  orders: CustomerOrder[];
  profile: CustomerProfile | null;
  
  // Admin customer management state
  customers: Customer[];
  
  loading: boolean;
  error: string | null;
  
  // Customer portal methods
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<CustomerOrder | null>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<void>;
  
  // Admin customer management methods
  fetchCustomers: () => Promise<void>;
  createCustomer: (data: CreateCustomerData) => Promise<void>;
  updateCustomer: (id: string, data: UpdateCustomerData) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  clearError: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  orders: [],
  profile: null,
  customers: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{ success: boolean; data: CustomerOrder[] }>("/api/customers/me/orders");
      if (response.success) {
        set({ orders: response.data, loading: false });
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch orders";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchOrderById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{ success: boolean; data: CustomerOrder }>(`/api/customers/me/orders/${id}`);
      if (response.success) {
        set({ loading: false });
        return response.data;
      } else {
        throw new Error("Failed to fetch order");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch order";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{ success: boolean; data: CustomerProfile }>("/api/customers/me");
      if (response.success) {
        set({ profile: response.data, loading: false });
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch profile";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  updateProfile: async (data: Partial<CustomerProfile>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<{ success: boolean; data: CustomerProfile }>("/api/customers/me", data);
      if (response.success) {
        set({ profile: response.data, loading: false });
        toast.success("Profile updated successfully");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  // Admin customer management methods
  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const customers = await apiClient.get<Customer[]>("/api/customers");
      set({ customers, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch customers";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  createCustomer: async (data: CreateCustomerData) => {
    set({ loading: true, error: null });
    try {
      const customer = await apiClient.post<Customer>("/api/customers", data);
      set(state => ({ 
        customers: [...state.customers, customer], 
        loading: false 
      }));
      // Don't show toast here - let the component handle it
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create customer";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateCustomer: async (id: string, data: UpdateCustomerData) => {
    set({ loading: true, error: null });
    try {
      const updatedCustomer = await apiClient.put<Customer>(`/api/customers/${id}`, data);
      set(state => ({
        customers: state.customers.map(c => c.id === id ? updatedCustomer : c),
        loading: false
      }));
      toast.success("Customer updated successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update customer";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteCustomer: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/customers/${id}`);
      set(state => ({
        customers: state.customers.filter(c => c.id !== id),
        loading: false
      }));
      toast.success("Customer deleted successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete customer";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));