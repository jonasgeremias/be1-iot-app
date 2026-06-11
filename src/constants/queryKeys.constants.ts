/** Centralized React Query keys for cache consistency across features. */
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  dashboard: {
    highlights: ['dashboard', 'highlights'] as const,
    summary: ['dashboard', 'summary'] as const,
  },
  devices: {
    all: ['devices'] as const,
    list: (filter?: string) => ['devices', 'list', filter ?? 'all'] as const,
    detail: (id: string) => ['devices', 'detail', id] as const,
    config: (id: string) => ['devices', 'config', id] as const,
    history: (id: string, period?: string) =>
      ['devices', 'history', id, period ?? '7d'] as const,
  },
  profile: {
    me: ['profile', 'me'] as const,
  },
  support: {
    info: ['support', 'info'] as const,
  },
} as const;
