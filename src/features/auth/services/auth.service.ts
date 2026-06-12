import { apiClient } from '@/services/api/axios';
import { logger } from '@/services/logger/logger';

import { sessionSchema, type LoginInput, type Session } from '../schemas/auth.schema';

/**
 * Auth domain service — real backend (be1-app parity).
 *  - login: POST /sessions (identifier may be e-mail or CPF)
 *  - forgot: POST /password/forgot/sms
 */
export const authService = {
  async login(input: LoginInput): Promise<Session> {
    // be1-app: e-mail kept as-is, CPF reduced to digits.
    const identifier = input.email.includes('@')
      ? input.email.trim()
      : input.email.replace(/\D/g, '');

    const { data } = await apiClient.post('/sessions', {
      email: identifier,
      password: input.password,
    });

    const result = sessionSchema.safeParse(data);
    if (!result.success) {
      logger.warn('auth.service', 'session validation fallback', {
        issues: result.error.issues.slice(0, 3),
      });
      return data as Session;
    }
    return result.data as Session;
  },

  async requestPasswordReset(identifier: string): Promise<{ ok: true }> {
    await apiClient.post('/password/forgot/sms', { phone: identifier });
    return { ok: true };
  },
};
