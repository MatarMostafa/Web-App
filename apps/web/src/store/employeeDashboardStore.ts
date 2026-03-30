import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

interface EmployeeOrder {
  id: string;
  orderNumber: string;
  title: string;
  description?: string;
  scheduledDate: string;
  status: string;
  priority: number;
  estimatedHours?: number;
  actualHours?: number;
  assignment?: {
    id: string;
    employeeId: string;
    assignedDate: string;
    startDate?: string;
    endDate?: string;
    status: string;
    notes?: string;
    startedBy?: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

interface EmployeeLeaveStats {
  totalDays: number;
  approvedDays: number;
  pendingDays: number;
  rejectedDays: number;
  byType: Record<string, number>;
  byStatus: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  };
}

interface EmployeeDashboardStats {
  currentWeekOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalHoursWorked: number;
  averageHoursPerOrder: number;
  upcomingDeadlines: number;
}

interface EmployeeDashboardState {
  currentWeekOrders: EmployeeOrder[];
  archivedOrders: EmployeeOrder[];
  dashboardStats: EmployeeDashboardStats | null;
  leaveStats: EmployeeLeaveStats | null;
  loading: boolean;
  error: string | null;
  
  fetchCurrentWeekOrders: () => Promise<void>;
  fetchArchivedOrders: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchLeaveStats: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeDashboardStore = create<EmployeeDashboardState>((set, get) => ({
  currentWeekOrders: [],
  archivedOrders: [],
  dashboardStats: null,
  leaveStats: null,
  loading: false,
  error: null,

  fetchCurrentWeekOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await apiClient.get<EmployeeOrder[]>("/api/employee/current-week-orders");
      set({ currentWeekOrders: orders, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch current week orders";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchArchivedOrders: async () => {
    set({ error: null });
    try {
      const orders = await apiClient.get<EmployeeOrder[]>("/api/employee/archived-orders");
      set({ archivedOrders: orders });
    } catch (error) {
      console.error("Failed to fetch archived orders:", error);
    }
  },

  fetchDashboardStats: async () => {
    set({ error: null });
    try {
      const stats = await apiClient.get<EmployeeDashboardStats>("/api/employee/dashboard-stats");
      set({ dashboardStats: stats });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  },

  fetchLeaveStats: async () => {
    set({ error: null });
    try {
      const stats = await apiClient.get<EmployeeLeaveStats>("/api/absences/my-stats");
      set({ leaveStats: stats });
    } catch (error) {
      console.error("Failed to fetch leave stats:", error);
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const { currentWeekOrders, fetchCurrentWeekOrders, fetchDashboardStats } = get();
    const order = currentWeekOrders.find(o => o.id === orderId);
    
    try {
      if (status === 'IN_PROGRESS' && order?.assignment?.employeeId) {
        // Individual start work for yourself
        await apiClient.post(`/api/orders/${orderId}/start-work`, { 
          employeeIds: [order.assignment.employeeId] 
        });
      } else if (status === 'PAUSED' && order?.assignment?.id) {
        // Individual pause work
        await apiClient.post(`/api/orders/${orderId}/pause-work/${order.assignment.employeeId}`, {});
      } else {
        // Fallback or other statuses (like COMPLETED)
        await apiClient.put(`/api/employee/orders/${orderId}/status`, { status });
      }

      toast.success("Status updated successfully");
      
      // Refresh data
      await Promise.all([
        fetchCurrentWeekOrders(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));