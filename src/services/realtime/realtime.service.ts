import { featureFlags } from '@/config/feature-flags';

import { logger } from '../logger/logger';
import { getSocket } from './socket';
import type { RealtimeEvent, RealtimeEventMap } from './socket.types';

/**
 * Framework-agnostic realtime facade. Feature hooks subscribe here and push
 * incoming events into the React Query cache — there is no parallel state.
 *
 * While the app runs on mock services there is no live server, so connect() is
 * a no-op-safe call; subscriptions still work once a backend is wired.
 */
export const realtimeService = {
  connect() {
    if (!featureFlags.realtimeEnabled) return;
    try {
      getSocket().connect();
    } catch (e) {
      logger.warn('realtime', 'connect failed', e);
    }
  },

  disconnect() {
    try {
      getSocket().disconnect();
    } catch {
      /* noop */
    }
  },

  on<E extends RealtimeEvent>(
    event: E,
    handler: (payload: RealtimeEventMap[E]) => void,
  ): () => void {
    const s = getSocket();
    s.on(event as string, handler as (...args: unknown[]) => void);
    return () => s.off(event as string, handler as (...args: unknown[]) => void);
  },
};
