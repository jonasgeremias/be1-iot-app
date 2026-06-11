import { create } from 'zustand';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';

/** UI-only theme preference. The prototype ships both light & dark. */
export type ThemeMode = 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  hydrate: () => Promise<void>;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  hydrated: false,
  setMode: (mode) => {
    set({ mode });
    void storage.set(StorageKeys.themeMode, mode);
  },
  toggle: () => get().setMode(get().mode === 'light' ? 'dark' : 'light'),
  hydrate: async () => {
    const saved = await storage.get(StorageKeys.themeMode);
    set({
      mode: saved === 'dark' ? 'dark' : 'light',
      hydrated: true,
    });
  },
}));
