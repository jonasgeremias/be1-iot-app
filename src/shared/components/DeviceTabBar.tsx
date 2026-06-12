import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Activity,
  Bell,
  LineChart,
  SlidersHorizontal,
} from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, XStack, YStack } from 'tamagui';

import { usePermissions } from '@/hooks/usePermissions';
import { Text } from '@/shared/ui/Text';

type TabMeta = {
  label: string;
  Icon: typeof Activity;
  /** Only shown to IoT admins. */
  adminOnly?: boolean;
};

const TABS: Record<string, TabMeta> = {
  index: { label: 'Tempo Real', Icon: Activity },
  history: { label: 'Histórico', Icon: LineChart },
  events: { label: 'Eventos', Icon: Bell },
  config: { label: 'Configuração', Icon: SlidersHorizontal, adminOnly: true },
};

const ORDER = ['index', 'history', 'events', 'config'];

/** Device-detail bottom tabs. The Configuração tab is admin-only. */
export function DeviceTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isIotAdmin } = usePermissions();

  const visible = ORDER.filter((name) => {
    const meta = TABS[name];
    if (!meta) return false;
    return !meta.adminOnly || isIotAdmin;
  });

  return (
    <XStack
      ai="stretch"
      jc="space-around"
      gap="$8"
      bg="$surface"
      borderTopWidth={1}
      borderTopColor="$border"
      pt="$9"
      px="$14"
      pb={14 + insets.bottom}
    >
      {visible.map((name) => {
        const meta = TABS[name]!;
        const routeIndex = state.routes.findIndex((r) => r.name === name);
        const route = state.routes[routeIndex];
        if (!route) return null;
        const focused = state.index === routeIndex;
        const color = focused ? '$brand' : '$text3';
        const { Icon } = meta;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <YStack
            key={name}
            flex={1}
            ai="center"
            gap="$5"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            cursor="pointer"
          >
            <View
              width="100%"
              height={34}
              br={11}
              ai="center"
              jc="center"
              bg={focused ? '$brandSoft' : 'transparent'}
              animation="quick"
            >
              <Icon size={20} color={color} />
            </View>
            <Text fontSize="$10.5" fontWeight="700" color={color}>
              {meta.label}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
}
