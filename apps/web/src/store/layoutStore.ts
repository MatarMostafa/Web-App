import { create } from "zustand";

type LayoutState = {
  fullWidth: boolean;
  toggleFullWidth: () => void;
};

export const useLayoutStore = create<LayoutState>((set) => ({
  fullWidth: false, // Default value
  toggleFullWidth: () => set((state) => ({ fullWidth: !state.fullWidth })),
}));