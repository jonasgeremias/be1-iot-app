import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/store/auth.store';

/** Auth stack — an already-authenticated user is sent to the app. */
export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);

  if (bootstrapped && isAuthenticated) return <Redirect href="/(main)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
