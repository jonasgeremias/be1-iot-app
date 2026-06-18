import { Redirect, Tabs } from 'expo-router';

import { useAuthStore } from '@/store/auth.store';

export const unstable_settings = {
  initialRouteName: 'index',
};

/**
 * Main navigator — gated: an unauthenticated user is sent to login. The bottom
 * tab bar was removed in favor of a home hub: the Início screen routes to each
 * section via its access cards, and the header avatar opens the profile.
 */
export default function MainLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);

  // Wait for the session check, then guard the whole group.
  if (!bootstrapped) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs backBehavior="history" tabBar={() => null} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="devices" options={{ title: 'Monitoramento' }} />
      <Tabs.Screen name="assist" options={{ title: 'Assistências' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notificações' }} />
    </Tabs>
  );
}
