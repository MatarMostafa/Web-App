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
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.log("API Error Response:", errorData);
        // Extract the specific error message from the API response
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (parseError) {
        console.log('JSON parse failed, trying text');
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Keep the default HTTP error message
        }
      }
      console.log('Throwing error with message:', errorMessage);
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
      throw error; // Let the calling code handle the error message
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
      console.error("PUT error:", error);
      throw error; // Let the calling code handle the error message
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
