import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';
import { useAuthStore } from '@/store/auth.store';

import { authService } from '../services/auth.service';
import type { LoginInput } from '../schemas/auth.schema';

/** Performs login, persists the token, flips session state, routes to home. */
export function useLogin() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: async (session, variables) => {
      await storage.set(StorageKeys.authToken, session.token);
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
