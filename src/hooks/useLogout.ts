import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';
import { useAuthStore } from '@/store/auth.store';

/** Clears the session (token/refresh/user + cache) and routes back to login. */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const signOut = useAuthStore((s) => s.signOut);

  return useCallback(async () => {
    await Promise.all([
      storage.remove(StorageKeys.authToken),
      storage.remove(StorageKeys.refreshToken),
      storage.remove(StorageKeys.userId),
      storage.remove(StorageKeys.userName),
      storage.remove(StorageKeys.permissions),
    ]);
    queryClient.clear();
    signOut();
    router.replace('/(auth)/login');
  }, [queryClient, router, signOut]);
}
