import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

interface DashboardStats {
  ordersLast30Days: number;
  newCustomersLast30Days: number;
  newEmployeesLast30Days: number;
  employeesOnLeave: number;
  unassignedOrders: number;
  completedOrders: number;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  avgOrdersPerCustomer: number;
}

interface AverageValues {
  avgOrderDuration: number;
  avgEmployeeHourlyRate: number;
  avgEstimatedHours: number;
  avgActualHours: number;
}

interface EmployeeHours {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  totalActualHours: number;
  totalEstimatedHours: number;
  assignmentCount: number;
}

interface AdminState {
  dashboardStats: DashboardStats | null;
  customerStats: CustomerStats | null;
  averageValues: AverageValues | null;
  employeeHours: EmployeeHours[];
  loading: boolean;
  error: string | null;
  
  fetchDashboardStats: () => Promise<void>;
  fetchCustomerStats: () => Promise<void>;
  fetchAverageValues: () => Promise<void>;
  fetchEmployeeHours: () => Promise<void>;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  dashboardStats: null,
  customerStats: null,
  averageValues: null,
  employeeHours: [],
  loading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await apiClient.get<DashboardStats>("/api/admin/dashboard");
      set({ dashboardStats: stats, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch dashboard stats";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchCustomerStats: async () => {
    try {
      const stats = await apiClient.get<CustomerStats>("/api/admin/customerStatistics");
      set({ customerStats: stats });
    } catch (error) {
      console.error("Failed to fetch customer stats:", error);
    }
  },

  fetchAverageValues: async () => {
    try {
      const values = await apiClient.get<AverageValues>("/api/admin/averageValues");
      set({ averageValues: values });
    } catch (error) {
      console.error("Failed to fetch average values:", error);
    }
  },

  fetchEmployeeHours: async () => {
    try {
      const hours = await apiClient.get<EmployeeHours[]>("/api/admin/hours");
      set({ employeeHours: hours });
    } catch (error) {
      console.error("Failed to fetch employee hours:", error);
    }
  },

  clearError: () => set({ error: null }),
}));