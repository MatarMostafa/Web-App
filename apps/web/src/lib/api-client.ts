import { getSession } from "next-auth/react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private async getAuthHeaders() {
    try {
      const session = await getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      return headers;
    } catch (error) {
      console.error("Error getting session:", error);
      return {
        "Content-Type": "application/json",
      };
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP error! status: ${response.status}`;
      } catch {
        errorMessage =
          (await response.text()) || `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      console.log("Making GET request to:", `${API_URL}${endpoint}`);
      console.log("Headers:", headers);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers,
        mode: "cors",
        // include cookies for cross-site requests when server allows credentials
        credentials: "include",
      });

      console.log("Response status:", response.status);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("API GET error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to fetch data: ${errorMessage}`);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(data),
        mode: "cors",
        credentials: "include",
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      toast.error(`Failed to create: ${error}`);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(data),
        mode: "cors",
        credentials: "include",
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      toast.error(`Failed to update: ${error}`);
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers: await this.getAuthHeaders(),
        mode: "cors",
        credentials: "include",
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      toast.error(`Failed to delete: ${error}`);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
