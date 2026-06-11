import { create } from 'zustand';

/** Misc global UI state (non-server). */
type AppState = {
  activeDeviceFilter: 'all' | 'online' | 'offline' | 'alert';
  setActiveDeviceFilter: (f: AppState['activeDeviceFilter']) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeDeviceFilter: 'all',
  setActiveDeviceFilter: (activeDeviceFilter) => set({ activeDeviceFilter }),
}));
