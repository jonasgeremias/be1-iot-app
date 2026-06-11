import { useEffect, useState } from 'react';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';
import { useAuthStore } from '@/store/auth.store';
import { isTokenExpired } from '@/utils/jwt.util';

/**
 * Restores the session from storage on launch (be1-app loadUserData parity):
 * a stored, non-expired refresh token means the session is still valid.
 */
export function useAuthBootstrap() {
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
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
        ]);
        signOut();
      }
      setBootstrapped(true);
      if (active) {
        setAuthed(valid);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [signIn, signOut, setBootstrapped]);

  return { ready, authed };
}
