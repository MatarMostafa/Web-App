import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  user_metadata: {
    display_name?: string;
    email: string;
    email_verified: boolean;
  };
  app_metadata: {
    provider: string;
    providers: string[];
  };
}

interface AdminStore {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (userData: { email: string; password: string; display_name: string }) => Promise<void>;
  editUser: (id: string, userData: { email: string; display_name: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      
      set({ users: data.users, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },
  addUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }
      
      // Optimistic update: add new user to existing list
      set((state) => ({
        users: [data.user, ...state.users],
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
      throw error;
    }
  },
  editUser: async (id, userData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      
      // Optimistic update: update user in existing list
      set((state) => ({
        users: state.users.map(user => 
          user.id === id ? data.user : user
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
      throw error;
    }
  },
  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to delete user (${response.status})`);
      }
      
      // Optimistic update: remove user from existing list
      set((state) => ({
        users: state.users.filter(user => user.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Delete user error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
      throw error;
    }
  },
}));