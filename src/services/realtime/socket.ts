import { io, type Socket } from 'socket.io-client';

import { env } from '@/config/env';

import { logger } from '../logger/logger';

/**
 * Lazily-created Socket.IO client. Isolated here so the rest of the app never
 * touches the transport directly. Not auto-connected — `realtime.service`
 * controls the lifecycle.
 */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(env.SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
    socket.on('connect', () => logger.info('socket', 'connected'));
    socket.on('disconnect', (r) => logger.warn('socket', `disconnected: ${r}`));
  }
  return socket;
}
