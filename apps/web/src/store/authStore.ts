import { create } from "zustand";
import { signOut } from "next-auth/react";
import { useEmployeeStore } from "./employeeStore";
import { useOrderStore } from "./orderStore";
import { useCustomerStore } from "./customerStore";
import { useDepartmentStore } from "./departmentStore";
import { usePositionStore } from "./positionStore";
import toast from "react-hot-toast";

interface AuthState {
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
  logout: async () => {
    try {
      // Clear all store states
      useEmployeeStore.getState().clearError();
      useOrderStore.getState().clearError();
      useCustomerStore.getState().clearError();
      useDepartmentStore.getState().clearError();
      usePositionStore.getState().clearError();

      // Reset all stores to initial state
      useEmployeeStore.setState({
        employees: [],
        currentEmployee: null,
        employeeAssignments: [],
        loading: false,
        isLoadingEmployee: false,
        isLoadingAssignments: false,
        error: null,
      });

      useOrderStore.setState({
        orders: [],
        currentOrder: null,
        loading: false,
        isLoadingOrder: false,
        error: null,
      });

      useCustomerStore.setState({
        customers: [],
        currentCustomer: null,
        loading: false,
        isLoadingCustomer: false,
        error: null,
      });

      useDepartmentStore.setState({
        departments: [],
        currentDepartment: null,
        loading: false,
        isLoadingDepartment: false,
        error: null,
      });

      usePositionStore.setState({
        positions: [],
        currentPosition: null,
        loading: false,
        isLoadingPosition: false,
        error: null,
      });

      // Sign out from NextAuth
      await signOut({ redirect: false });

      toast.success("Logged out successfully!");

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  },
}));
