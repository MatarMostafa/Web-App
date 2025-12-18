import { apiClient } from "@/lib/api-client";
import { OrderStatus } from "@/types/order";

export interface OrderActivity {
  id: string;
  type: 'STATUS_CHANGE' | 'NOTE_ADDED' | 'ASSIGNMENT_CHANGED' | 'ORDER_CREATED' | 'ACTIVITY_ASSIGNED';
  description: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  metadata?: {
    oldStatus?: OrderStatus;
    newStatus?: OrderStatus;
    noteContent?: string;
    category?: string;
    activityName?: string;
    activityCode?: string;
    quantity?: number;
    unitPrice?: number;
    lineTotal?: number;
    unit?: string;
  };
}

class OrderActivitiesApi {
  async getOrderActivities(orderId: string): Promise<OrderActivity[]> {
    try {
      const result = await apiClient.get<{ success: boolean; data: OrderActivity[] }>(
        `/api/orders/${orderId}/activities`
      );
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Failed to fetch order activities:", error);
      return [];
    }
  }
}

export const orderActivitiesApi = new OrderActivitiesApi();