import { create } from "zustand";
import { Position, CreatePositionData, UpdatePositionData } from "@/types/position";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

interface PositionState {
  positions: Position[];
  currentPosition: Position | null;
  loading: boolean;
  isLoadingPosition: boolean;
  error: string | null;
  
  // Actions
  fetchPositions: () => Promise<void>;
  fetchPosition: (id: string) => Promise<void>;
  createPosition: (data: CreatePositionData) => Promise<void>;
  updatePosition: (id: string, data: UpdatePositionData) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
  updatePositionStatus: (id: string, isActive: boolean) => Promise<void>;
  clearError: () => void;
}

export const usePositionStore = create<PositionState>((set, get) => ({
  positions: [],
  currentPosition: null,
  loading: false,
  isLoadingPosition: false,
  error: null,

  fetchPositions: async () => {
    set({ loading: true, error: null });
    try {
      const positions = await apiClient.get<Position[]>("/api/positions");
      set({ positions, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch positions";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  fetchPosition: async (id: string) => {
    set({ isLoadingPosition: true, error: null });
    try {
      const position = await apiClient.get<Position>(`/api/positions/${id}`);
      set({ currentPosition: position, isLoadingPosition: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch position", isLoadingPosition: false });
    }
  },

  createPosition: async (data: CreatePositionData) => {
    set({ loading: true, error: null });
    try {
      const newPosition = await apiClient.post<Position>("/api/positions", data);
      set(state => ({ 
        positions: [...state.positions, newPosition], 
        loading: false 
      }));
      toast.success("Position created successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to create position", loading: false });
      throw error;
    }
  },

  updatePosition: async (id: string, data: UpdatePositionData) => {
    set({ loading: true, error: null });
    try {
      const updatedPosition = await apiClient.put<Position>(`/api/positions/${id}`, data);
      set(state => ({
        positions: state.positions.map(pos => pos.id === id ? updatedPosition : pos),
        loading: false
      }));
      toast.success("Position updated successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update position", loading: false });
      throw error;
    }
  },

  deletePosition: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/positions/${id}`);
      set(state => ({
        positions: state.positions.filter(pos => pos.id !== id),
        loading: false
      }));
      toast.success("Position deleted successfully");
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to delete position", loading: false });
      throw error;
    }
  },

  updatePositionStatus: async (id: string, isActive: boolean) => {
    set({ loading: true, error: null });
    try {
      const updatedPosition = await apiClient.put<Position>(`/api/positions/${id}/status`, { isActive });
      set(state => ({
        positions: state.positions.map(pos => pos.id === id ? updatedPosition : pos),
        loading: false
      }));
      toast.success(`Position ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update position status", loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));