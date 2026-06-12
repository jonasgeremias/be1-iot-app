 

/** Tiny framework-agnostic logger. Swappable for Sentry/etc. later. */
type Level = 'debug' | 'info' | 'warn' | 'error';

function emit(level: Level, scope: string, msg: string, data?: unknown) {
  const prefix = `[BE1:${scope}]`;
  if (level === 'error') console.error(prefix, msg, data ?? '');
  else if (level === 'warn') console.warn(prefix, msg, data ?? '');
  else if (__DEV__) console.log(prefix, msg, data ?? '');
}

export const logger = {
  debug: (scope: string, msg: string, data?: unknown) => emit('debug', scope, msg, data),
  info: (scope: string, msg: string, data?: unknown) => emit('info', scope, msg, data),
  warn: (scope: string, msg: string, data?: unknown) => emit('warn', scope, msg, data),
  error: (scope: string, msg: string, data?: unknown) => emit('error', scope, msg, data),
};
