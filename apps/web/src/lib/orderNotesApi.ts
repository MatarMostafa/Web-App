import { OrderStatus } from "@/types/order";
import { apiClient } from "@/lib/api-client";

export interface OrderNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  category: "COMPLETION_REQUEST" | "ADMIN_RESPONSE" | "GENERAL_UPDATE" | "ISSUE_REPORT";
  isInternal: boolean;
  createdAt: string;
  triggersStatus?: OrderStatus;
}

export interface CreateOrderNoteData {
  content: string;
  triggersStatus?: OrderStatus;
  category?: string;
  isInternal?: boolean;
}

export interface UpdateOrderNoteData {
  content?: string;
  category?: string;
  isInternal?: boolean;
}

class OrderNotesApi {
  async getOrderNotes(orderId: string): Promise<OrderNote[]> {
    try {
      const result = await apiClient.get<{ success: boolean; data: OrderNote[] }>(
        `/api/orders/${orderId}/notes`
      );
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      return [];
    }
  }

  async createOrderNote(orderId: string, data: CreateOrderNoteData): Promise<OrderNote | null> {
    try {
      const result = await apiClient.post<{ success: boolean; data: OrderNote }>(
        `/api/orders/${orderId}/notes`,
        data
      );
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Failed to create note:", error);
      throw error;
    }
  }

  async getOrderNoteById(orderId: string, noteId: string): Promise<OrderNote | null> {
    try {
      const result = await apiClient.get<{ success: boolean; data: OrderNote }>(
        `/api/orders/${orderId}/notes/${noteId}`
      );
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Failed to fetch note:", error);
      return null;
    }
  }

  async updateOrderNote(
    orderId: string,
    noteId: string,
    data: UpdateOrderNoteData
  ): Promise<OrderNote | null> {
    try {
      const result = await apiClient.put<{ success: boolean; data: OrderNote }>(
        `/api/orders/${orderId}/notes/${noteId}`,
        data
      );
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Failed to update note:", error);
      throw error;
    }
  }

  async deleteOrderNote(orderId: string, noteId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/orders/${orderId}/notes/${noteId}`);
      return true;
    } catch (error) {
      console.error("Failed to delete note:", error);
      throw error;
    }
  }

  async getOrderNotesCount(orderId: string): Promise<number> {
    try {
      const result = await apiClient.get<{ success: boolean; data: { count: number } }>(
        `/api/orders/${orderId}/notes/count`
      );
      return result.success ? result.data.count : 0;
    } catch (error) {
      console.error("Failed to fetch notes count:", error);
      return 0;
    }
  }
}

export const orderNotesApi = new OrderNotesApi();