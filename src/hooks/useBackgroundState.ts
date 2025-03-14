// src/hooks/useBackgroundState.ts
import { create } from "zustand";

type BackgroundState = {
  isVisible: boolean;
  opacity: number;
  zoom: number;
  setVisibility: (visible: boolean) => void;
  setOpacity: (opacity: number) => void;
  setZoom: (zoom: number) => void;
  reset: () => void;
};

export const useBackgroundState = create<BackgroundState>((set) => ({
  isVisible: true, // Ensure this is always true by default
  opacity: 1,
  zoom: 1,
  setVisibility: (visible) => set({ isVisible: visible }),
  setOpacity: (opacity) =>
    set({ opacity: Math.max(0.5, Math.min(1, opacity)) }), // Changed min from 0 to 0.5 to ensure some visibility
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(1.5, zoom)) }),
  reset: () => set({ isVisible: true, opacity: 1, zoom: 1 }),
}));
