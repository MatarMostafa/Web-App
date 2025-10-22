import { create } from "zustand";
import { Customer, CreateCustomerData, UpdateCustomerData } from "@/types/customer";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  loading: boolean;
  isLoadingCustomer: boolean;
  error: string | null;
  
  // Actions
  fetchCustomers: () => Promise<void>;
  fetchCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  createCustomer: (data: CreateCustomerData) => Promise<void>;
  updateCustomer: (id: string, data: UpdateCustomerData) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  currentCustomer: null,
  loading: false,
  isLoadingCustomer: false,
  error: null,

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

  fetchCustomer: async (id: string) => {
    set({ isLoadingCustomer: true, error: null });
    try {
      const customer = await apiClient.get<Customer>(`/api/customers/${id}`);
      set({ currentCustomer: customer, isLoadingCustomer: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch customer", isLoadingCustomer: false });
    }
  },

  getCustomerById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const customer = await apiClient.get<Customer>(`/api/customers/${id}`);
      set({ loading: false });
      return customer;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch customer", loading: false });
      return null;
    }
  },

  createCustomer: async (data: CreateCustomerData) => {
    set({ loading: true, error: null });
    try {
      const newCustomer = await apiClient.post<Customer>("/api/customers", data);
      set(state => ({ 
        customers: [...state.customers, newCustomer], 
        loading: false 
      }));
      toast.success("Customer created successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to create customer", loading: false });
      throw error;
    }
  },

  updateCustomer: async (id: string, data: UpdateCustomerData) => {
    set({ loading: true, error: null });
    try {
      const updatedCustomer = await apiClient.put<Customer>(`/api/customers/${id}`, data);
      set(state => ({
        customers: state.customers.map(customer => customer.id === id ? updatedCustomer : customer),
        loading: false
      }));
      toast.success("Customer updated successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update customer", loading: false });
      throw error;
    }
  },

  deleteCustomer: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/customers/${id}`);
      set(state => ({
        customers: state.customers.filter(customer => customer.id !== id),
        loading: false
      }));
      toast.success("Customer deleted successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to delete customer", loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));