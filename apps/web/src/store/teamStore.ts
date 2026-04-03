import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import { Team } from "@/types/team";
import toast from "react-hot-toast";

interface TeamState {
  teams: Team[];
  loading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  getTeamById: (id: string) => Promise<Team | null>;
  clearError: () => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  loading: false,
  error: null,

  fetchTeams: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<{ success: boolean; data: Team[] }>("/api/teams");
      // The API might return the array directly or wrapped in success/data
      const teams = Array.isArray(response) ? response : (response.data || []);
      set({ teams, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch teams";
      set({ error: errorMessage, loading: false });
      // Toast is already handled in apiClient
    }
  },

  getTeamById: async (id: string) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Team }> (`/api/teams/${id}`);
      return Array.isArray(response) ? null : (response.data || response);
    } catch (error) {
      console.error(`Error fetching team ${id}:`, error);
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
