import { create } from 'zustand';

/**
 * Session/UI auth state only — NEVER API/profile data (that belongs to React
 * Query). Holds just enough to gate navigation.
 */
type AuthState = {
  isAuthenticated: boolean;
  bootstrapped: boolean;
  signIn: () => void;
  signOut: () => void;
  setBootstrapped: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  bootstrapped: false,
  signIn: () => set({ isAuthenticated: true }),
  signOut: () => set({ isAuthenticated: false }),
  setBootstrapped: (v) => set({ bootstrapped: v }),
}));
