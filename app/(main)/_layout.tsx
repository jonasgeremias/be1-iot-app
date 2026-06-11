import { Tabs } from 'expo-router';

import { MainTabBar } from '@/shared/components/MainTabBar';

export const unstable_settings = {
  initialRouteName: 'index',
};

/** Main tab navigator — declares the four tabs from the prototype's `Nav`. */
export default function MainLayout() {
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
