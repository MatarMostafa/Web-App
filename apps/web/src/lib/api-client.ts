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
      let errorData;
      try {
        errorData = await response.json();
        console.log("API Error Response:", errorData);
        errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP error! status: ${response.status}`;
      } catch {
        const errorText = await response.text();
        console.log("API Error Text:", errorText);
        errorMessage = errorText || `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
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
      console.log("Making POST request to:", `${API_URL}${endpoint}`);
      console.log("POST data:", data);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      console.log("POST response status:", response.status);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("POST error:", error);
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
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      toast.error(`Failed to delete: ${error}`);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
