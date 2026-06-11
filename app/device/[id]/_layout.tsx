import { Tabs } from 'expo-router';

import { DeviceTabBar } from '@/shared/components/DeviceTabBar';

export const unstable_settings = {
  initialRouteName: 'index',
};

/** Device-detail tab navigator (Tempo Real · Configuração · Histórico). */
export default function DeviceDetailLayout() {
  return (
    <Tabs
      tabBar={(props) => <DeviceTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Tempo Real' }} />
      <Tabs.Screen name="config" options={{ title: 'Configuração' }} />
      <Tabs.Screen name="history" options={{ title: 'Histórico' }} />
    </Tabs>
  );
}
