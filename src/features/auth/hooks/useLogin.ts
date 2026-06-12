import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';
import { useAuthStore } from '@/store/auth.store';

import { authService } from '../services/auth.service';
import type { LoginInput } from '../schemas/auth.schema';

/** Performs login, persists token/refreshToken/userId, flips session, routes home. */
export function useLogin() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: async (session, variables) => {
      await Promise.all([
        storage.set(StorageKeys.authToken, session.token),
        storage.set(StorageKeys.refreshToken, session.refreshToken),
        storage.set(StorageKeys.userId, session.user.id),
        storage.set(StorageKeys.userName, session.user.name ?? ''),
        storage.set(StorageKeys.permissions, JSON.stringify(session.permissions ?? [])),
      ]);
      if (variables.remember) {
        await storage.set(StorageKeys.rememberEmail, variables.email);
      } else {
        await storage.remove(StorageKeys.rememberEmail);
      }
      signIn();
      router.replace('/(main)');
    },
  });
}
