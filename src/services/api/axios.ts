import { create } from 'axios';

import { env } from '@/config/env';

import { attachInterceptors } from './interceptors';

/**
 * Single Axios instance for all REST traffic. Domain services build on top of
 * this (e.g. `features/devices/services/device.service.ts`). Never imported
 * directly from screens/components — always via a hook → service.
 */
export const apiClient = create({
  baseURL: env.API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

attachInterceptors(apiClient);
