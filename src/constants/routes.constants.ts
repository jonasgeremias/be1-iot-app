/** Typed route helpers mirroring the `app/` tree. */
export const routes = {
  splash: '/',
  login: '/(auth)/login',
  forgotPassword: '/(auth)/forgot-password',
  home: '/(main)',
  devices: '/(main)/devices',
  profile: '/(main)/profile',
  assist: '/(main)/assist',
  deviceDetail: (id: string) => `/device/${id}` as const,
  deviceConfig: (id: string) => `/device/${id}/config` as const,
  deviceHistory: (id: string) => `/device/${id}/history` as const,
} as const;
