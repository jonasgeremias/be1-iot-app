import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Activity, LineChart, SlidersHorizontal } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, XStack, YStack } from 'tamagui';

import { Text } from '@/shared/ui/Text';

type TabMeta = {
  label: string;
  Icon: typeof Activity;
};

const TABS: Record<string, TabMeta> = {
  index: { label: 'Tempo Real', Icon: Activity },
  config: { label: 'Configuração', Icon: SlidersHorizontal },
  history: { label: 'Histórico', Icon: LineChart },
};

const ORDER = ['index', 'config', 'history'];

/**
 * Device-detail bottom tabs (the prototype's `DevTabs`): full-width chips that
 * fill with brand-soft when active.
 */
export function DeviceTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
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
      {ORDER.map((name) => {
        const meta = TABS[name];
        if (!meta) return null;
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
