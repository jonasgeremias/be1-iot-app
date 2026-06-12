import { useEffect } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';

import type { LoginInput } from '../schemas/auth.schema';

/** Prefills the login identifier saved by "Lembrar acesso". */
export function useRememberedLoginEmail(setValue: UseFormSetValue<LoginInput>) {
  useEffect(() => {
    void storage.get(StorageKeys.rememberEmail).then((saved) => {
      if (saved) setValue('email', saved);
    });
  }, [setValue]);
}
