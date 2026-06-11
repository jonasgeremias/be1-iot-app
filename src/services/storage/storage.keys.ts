/** Centralized storage keys to avoid stringly-typed collisions. */
export const StorageKeys = {
  authToken: 'be1.auth.token',
  themeMode: 'be1.theme.mode',
  rememberEmail: 'be1.auth.rememberEmail',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
