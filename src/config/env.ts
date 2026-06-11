import Constants from 'expo-constants';

/**
 * Centralized environment access. Reads from Expo public env vars when present
 * and falls back to sane local defaults. The app currently runs on mock
 * services (see `src/services`), so `API_URL` is only consumed once a real
 * backend is wired.
 */
type Extra = {
  apiUrl?: string;
  socketUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const env = {
  API_URL:
    process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? 'https://api.be1.com.br',
  SOCKET_URL:
    process.env.EXPO_PUBLIC_SOCKET_URL ??
    extra.socketUrl ??
    'https://rt.be1.com.br',
  // Toggle to swap mock services for the real API once it exists.
  USE_MOCKS: process.env.EXPO_PUBLIC_USE_MOCKS !== 'false',
} as const;
