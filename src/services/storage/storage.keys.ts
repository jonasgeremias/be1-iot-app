/** Centralized storage keys to avoid stringly-typed collisions. */
export const StorageKeys = {
  authToken: 'be1.auth.token',
  refreshToken: 'be1.auth.refreshToken',
  userId: 'be1.auth.userId',
  userName: 'be1.auth.userName',
  permissions: 'be1.auth.permissions',
  themeMode: 'be1.theme.mode',
  themePreference: 'be1.theme.preference',
  rememberEmail: 'be1.auth.rememberEmail',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
