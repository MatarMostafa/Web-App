import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

interface LeaveAbsence {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

interface LeaveStats {
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

interface CreateLeaveRequest {
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

interface EmployeeLeaveState {
  absences: LeaveAbsence[];
  stats: LeaveStats | null;
  loading: boolean;
  error: string | null;
  
  fetchMyAbsences: () => Promise<void>;
  fetchLeaveStats: () => Promise<void>;
  createLeaveRequest: (data: CreateLeaveRequest) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeLeaveStore = create<EmployeeLeaveState>((set, get) => ({
  absences: [],
  stats: null,
  loading: false,
  error: null,

  fetchMyAbsences: async () => {
    set({ loading: true, error: null });
    try {
      const absences = await apiClient.get<LeaveAbsence[]>("/api/absences/my-absences");
      set({ absences, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch absences";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchLeaveStats: async () => {
    set({ error: null });
    try {
      const stats = await apiClient.get<LeaveStats>("/api/absences/my-stats");
      set({ stats });
    } catch (error) {
      console.error('Error fetching leave stats:', error);
      set({ stats: null });
    }
  },

  createLeaveRequest: async (data: CreateLeaveRequest) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post("/api/employees-status/leave", data);
      toast.success("Leave request submitted successfully");
      
      // Refresh data
      const { fetchMyAbsences, fetchLeaveStats } = get();
      await fetchMyAbsences();
      await fetchLeaveStats();
      
      set({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit leave request";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));