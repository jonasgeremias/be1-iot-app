import { useEffect, useState } from 'react';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';

/** Reads the logged-in user's id from storage (set at login). */
export function useCurrentUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void storage.get(StorageKeys.userId).then((id) => {
      if (active) setUserId(id);
    });
    return () => {
      active = false;
    };
  }, []);

  return userId;
}
