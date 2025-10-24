const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = {
  register: async (data: { name: string; email: string; username: string; password: string; role?: string }) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }
    
    return result;
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send reset email');
    }
    
    return result;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to reset password');
    }
    
    return result;
  },

  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`);
    return response.json();
  },

  resendVerificationEmail: async (email: string) => {
    const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },
};