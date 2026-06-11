import { Redirect, Tabs } from 'expo-router';

import { MainTabBar } from '@/shared/components/MainTabBar';
import { useAuthStore } from '@/store/auth.store';

export const unstable_settings = {
  initialRouteName: 'index',
};

/** Main tab navigator — gated: an unauthenticated user is sent to login. */
export default function MainLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);

  // Wait for the session check, then guard the whole tab group.
  if (!bootstrapped) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="assist" options={{ title: 'Assistências' }} />
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="devices" options={{ title: 'Monitoramento' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
