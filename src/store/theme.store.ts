import { create } from 'zustand';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';

/** UI-only theme preference. The prototype ships both light & dark. */
export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

type ThemeState = {
  mode: ThemeMode;
  preference: ThemePreference;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  setSystemMode: (mode: ThemeMode) => void;
  useSystemMode: () => void;
  toggle: () => void;
  hydrate: (systemMode: ThemeMode) => Promise<void>;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  preference: 'system',
  hydrated: false,
  setMode: (mode) => {
    set({ mode, preference: mode });
    void storage.set(StorageKeys.themePreference, mode);
  },
  setSystemMode: (mode) => {
    if (get().preference === 'system') set({ mode });
  },
  useSystemMode: () => {
    set({ preference: 'system' });
    void storage.set(StorageKeys.themePreference, 'system');
  },
  toggle: () => get().setMode(get().mode === 'light' ? 'dark' : 'light'),
  hydrate: async (systemMode) => {
    const saved = await storage.get(StorageKeys.themePreference);
    const preference: ThemePreference =
      saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'system';

    set({
      preference,
      mode: preference === 'system' ? systemMode : preference,
      hydrated: true,
    });
  },
}));
