import { delay } from '@/utils/async.util';

import {
  sessionSchema,
  type LoginInput,
  type Session,
} from '../schemas/auth.schema';

/**
 * Auth domain service. Currently backed by mock data; the response is still
 * Zod-validated at the boundary so swapping in a real Axios call later requires
 * no changes to hooks/screens.
 */
export const authService = {
  async login(input: LoginInput): Promise<Session> {
    await delay(700);
    const raw = {
      token: 'mock.jwt.token',
      user: {
        id: '1',
        name: 'TI BE1',
        email: input.email,
        role: 'ADMINISTRADOR',
      },
    };
    return sessionSchema.parse(raw);
  },

  async requestPasswordReset(email: string): Promise<{ ok: true }> {
    await delay(700);
    void email;
    return { ok: true };
  },
};
