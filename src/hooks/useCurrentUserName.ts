import { useEffect, useState } from 'react';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';

/** The logged-in user's name (persisted at login), for greetings/headers. */
export function useCurrentUserName() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void storage.get(StorageKeys.userName).then((n) => {
      if (active) setName(n);
    });
    return () => {
      active = false;
    };
  }, []);

  return name;
}
