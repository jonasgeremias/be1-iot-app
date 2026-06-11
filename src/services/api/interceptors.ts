import type { AxiosInstance } from 'axios';

import { logger } from '../logger/logger';
import { storage } from '../storage/storage';
import { StorageKeys } from '../storage/storage.keys';
import type { ApiError } from './api.types';

/** Attaches auth-token injection and normalized error handling. */
export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(async (cfg) => {
    const token = await storage.get(StorageKeys.authToken);
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error?.response?.status ?? 0;
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
