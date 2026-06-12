import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

import { isTokenAboutToExpire, isTokenExpired } from '@/utils/jwt.util';
import { useAuthStore } from '@/store/auth.store';

import { logger } from '../logger/logger';
import { storage } from '../storage/storage';
import { StorageKeys } from '../storage/storage.keys';
import type { ApiError } from './api.types';
import { queryClient } from './queryClient';

type AuthConfig = AxiosRequestConfig & { skipAuthRefresh?: boolean };
type AuthInternalConfig = InternalAxiosRequestConfig & {
  skipAuthRefresh?: boolean;
  _retry?: boolean;
};

/** Singleton so concurrent requests share one in-flight refresh (be1-app §). */
let refreshPromise: Promise<string> | null = null;

async function clearSession() {
  await Promise.all([
    storage.remove(StorageKeys.authToken),
    storage.remove(StorageKeys.refreshToken),
    storage.remove(StorageKeys.userId),
    storage.remove(StorageKeys.userName),
    storage.remove(StorageKeys.permissions),
  ]);
}

async function forceSignOut() {
  await clearSession();
  queryClient.clear();
  useAuthStore.getState().signOut();
}

function makeRefresher(client: AxiosInstance) {
  return async function refreshAccessToken(): Promise<string> {
    const refreshToken = await storage.get(StorageKeys.refreshToken);
    if (!refreshToken || isTokenExpired(refreshToken)) {
      throw new Error('Refresh token inválido/expirado');
    }
    const cfg: AuthConfig = { skipAuthRefresh: true };
    const { data } = await client.post(
      '/refresh-token',
      { token: refreshToken },
      cfg,
    );
    await storage.set(StorageKeys.authToken, data.token);
    if (data.refreshToken) {
      await storage.set(StorageKeys.refreshToken, data.refreshToken);
    }
    return data.token as string;
  };
}

/**
 * Attaches auth-token injection with proactive refresh, 401 retry-with-refresh,
 * and normalized error handling (be1-app api.ts parity).
 */
export function attachInterceptors(client: AxiosInstance) {
  const refreshAccessToken = makeRefresher(client);

  client.interceptors.request.use(async (cfg) => {
    const config = cfg as AuthInternalConfig;
    if (config.skipAuthRefresh) return cfg;

    let token = await storage.get(StorageKeys.authToken);
    if (token && isTokenAboutToExpire(token)) {
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        token = await refreshPromise;
      } catch {
        // proactive refresh failed — let the request go and the 401 path decide
      }
    }
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error?.config as AuthInternalConfig | undefined;
      const status = error?.response?.status ?? 0;

      if (
        status === 401 &&
        original &&
        !original._retry &&
        !original.skipAuthRefresh
      ) {
        original._retry = true;
        try {
          refreshPromise ??= refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
          const newToken = await refreshPromise;
          original.headers.Authorization = `Bearer ${newToken}`;
          return client(original);
        } catch {
          await forceSignOut();
        }
      }

      const normalized: ApiError = {
        status,
        message:
          error?.response?.data?.message ??
          error?.message ??
          'Erro de comunicação',
        code: error?.response?.data?.code,
      };
      logger.error('api', normalized.message, { status });
      return Promise.reject(normalized);
    },
  );
}
