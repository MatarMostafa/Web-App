import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

interface Assignment {
  id: string;
  employeeId: string;
  orderId: string;
  assignedDate: string;
  order: {
    id: string;
    orderNumber: string;
    title: string;
    scheduledDate: string;
    status: string;
    priority: number;
  };
}

interface EmployeeOrdersState {
  employeeAssignments: Assignment[];
  isLoadingAssignments: boolean;
  error: string | null;

  fetchEmployeeAssignments: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeOrderStore = create<EmployeeOrdersState>((set) => ({
  employeeAssignments: [],
  isLoadingAssignments: false,
  error: null,

  fetchEmployeeAssignments: async (userId: string) => {
    set({ isLoadingAssignments: true, error: null });
    try {
      const assignments = await apiClient.get<Assignment[]>(
        `/api/employees/${userId}/assignments`
      );
      set({ employeeAssignments: assignments, isLoadingAssignments: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch assignments";
      set({ error: errorMessage, isLoadingAssignments: false });
      toast.error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));
