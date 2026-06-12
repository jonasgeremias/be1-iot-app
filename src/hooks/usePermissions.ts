import { useEffect, useState } from 'react';

import { IotPermissions } from '@/constants/permissions.constants';
import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';

/** The logged-in user's permissions (persisted at login) + IoT admin flag. */
export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void storage.get(StorageKeys.permissions).then((raw) => {
      if (!active) return;
      try {
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        setPermissions(Array.isArray(parsed) ? (parsed as string[]) : []);
      } catch {
        setPermissions([]);
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    permissions,
    ready,
    isIotAdmin: permissions.includes(IotPermissions.admin),
  };
}
