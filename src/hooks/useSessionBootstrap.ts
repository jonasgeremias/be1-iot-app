import { useEffect } from 'react';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';
import { useAuthStore } from '@/store/auth.store';
import { isTokenExpired } from '@/utils/jwt.util';

/**
 * Restores the session from storage once at app launch (be1-app loadUserData
 * parity): a stored, non-expired refresh token keeps the user signed in. Runs
 * globally so route guards have a definitive auth state regardless of the entry
 * route. Returns `ready` (true once the check has completed).
 */
export function useSessionBootstrap() {
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);

  useEffect(() => {
    if (bootstrapped) return;
    let active = true;
    void (async () => {
      const [token, refreshToken] = await Promise.all([
        storage.get(StorageKeys.authToken),
        storage.get(StorageKeys.refreshToken),
      ]);
      const valid = !!token && !!refreshToken && !isTokenExpired(refreshToken);

      if (valid) {
        signIn();
      } else {
        await Promise.all([
          storage.remove(StorageKeys.authToken),
          storage.remove(StorageKeys.refreshToken),
          storage.remove(StorageKeys.userId),
          storage.remove(StorageKeys.userName),
        ]);
        signOut();
      }
      if (active) setBootstrapped(true);
    })();
    return () => {
      active = false;
    };
  }, [bootstrapped, signIn, signOut, setBootstrapped]);

  return { ready: bootstrapped };
}
