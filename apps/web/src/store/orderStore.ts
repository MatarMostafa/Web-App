import { create } from "zustand";
import { Order, CreateOrderData, UpdateOrderData } from "@/types/order";
import { apiClient } from "@/lib/api-client";
import { getSession } from "next-auth/react";
import toast from "react-hot-toast";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  isLoadingOrder: boolean;
  error: string | null;
  
  // Actions
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  getOrderById: (id: string) => Promise<Order | null>;
  getOrderAssignments: (orderId: string) => Promise<string[]>;
  getOrderEmployeeNames: (orderId: string) => Promise<string>;
  createOrder: (data: CreateOrderData) => Promise<Order>;
  updateOrder: (id: string, data: UpdateOrderData) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => void;
  deleteOrder: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  isLoadingOrder: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      // Get user session to determine the correct endpoint
      const session = await getSession();
      const userRole = session?.user?.role;
      
      // Use team leader endpoint for team leaders, admin endpoint for admins
      const endpoint = userRole === "TEAM_LEADER" ? "/api/team-leader/orders" : "/api/orders";
      
      const orders = await apiClient.get<Order[]>(endpoint);
      set({ orders, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch orders";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchOrder: async (id: string) => {
    set({ isLoadingOrder: true, error: null });
    try {
      const order = await apiClient.get<Order>(`/api/orders/${id}`);
      console.log("Fetched order:", order);
      set({ currentOrder: order, isLoadingOrder: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch order", isLoadingOrder: false });
    }
  },

  getOrderById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const order = await apiClient.get<Order>(`/api/orders/${id}`);
      set({ loading: false });
      return order;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch order", loading: false });
      return null;
    }
  },

  getOrderAssignments: async (orderId: string) => {
    try {
      const employeeIds = await apiClient.get<string[]>(`/api/orders/${orderId}/assigned-employees`);
      return Array.isArray(employeeIds) ? employeeIds : [];
    } catch (error) {
      console.error('Failed to fetch order assignments:', error);
      // Fallback to old method
      try {
        const response = await apiClient.get<any>(`/api/orders/${orderId}/assignments`);
        const assignments = Array.isArray(response) ? response : (response?.data || response?.assignments || []);
        if (!Array.isArray(assignments)) {
          return [];
        }
        return assignments.map((a: any) => a.employeeId || a.id).filter(Boolean);
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        return [];
      }
    }
  },

  getOrderEmployeeNames: async (orderId: string) => {
    try {
      const response = await apiClient.get<any>(`/api/orders/${orderId}/assignments`);
      const assignments = Array.isArray(response) ? response : response.data || [];
      const names = assignments.map((a: any) => `${a.employee.firstName} ${a.employee.lastName}`);
      return names.length > 0 ? names.join(', ') : 'No employees assigned';
    } catch (error) {
      console.error('Failed to fetch employee names:', error);
      return 'Unknown';
    }
  },

  createOrder: async (data: CreateOrderData) => {
    set({ loading: true, error: null });
    try {
      // Get user session to determine the correct endpoint
      const session = await getSession();
      const userRole = session?.user?.role;
      
      // Use team leader endpoint for team leaders, admin endpoint for admins
      const endpoint = userRole === "TEAM_LEADER" ? "/api/team-leader/orders" : "/api/orders";
      
      const newOrder = await apiClient.post<Order>(endpoint, data);
      set(state => ({ 
        orders: [...state.orders, newOrder], 
        loading: false 
      }));
      toast.success(`Order ${newOrder.orderNumber} created successfully!`);
      return newOrder;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to create order", loading: false });
      throw error;
    }
  },

  updateOrder: async (id: string, data: UpdateOrderData) => {
    set({ loading: true, error: null });
    try {
      // Get user session to determine the correct endpoint
      const session = await getSession();
      const userRole = session?.user?.role;
      
      // Use team leader endpoint for team leaders, admin endpoint for admins
      const endpoint = userRole === "TEAM_LEADER" ? `/api/team-leader/orders/${id}` : `/api/orders/${id}`;
      
      const updatedOrder = await apiClient.put<Order>(endpoint, data);
      set(state => ({
        orders: state.orders.map(order => order.id === id ? updatedOrder : order),
        loading: false
      }));
      toast.success("Order updated successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update order", loading: false });
      throw error;
    }
  },

  updateOrderStatus: (id: string, status: string) => {
    set(state => ({
      orders: state.orders.map(order => 
        order.id === id ? { ...order, status: status as any } : order
      ),
      currentOrder: state.currentOrder?.id === id 
        ? { ...state.currentOrder, status: status as any }
        : state.currentOrder
    }));
  },

  deleteOrder: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/orders/${id}`);
      set(state => ({
        orders: state.orders.filter(order => order.id !== id),
        loading: false
      }));
      toast.success("Order deleted successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to delete order", loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));