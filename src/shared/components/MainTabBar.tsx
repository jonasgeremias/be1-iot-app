import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, User, Wrench, MonitorDot } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, XStack, YStack } from 'tamagui';

import { Text } from '@/shared/ui/Text';

type TabMeta = {
  label: string;
  Icon: typeof Home;
};

/** Route-name → label/icon, in the prototype's left-to-right tab order. */
const TABS: Record<string, TabMeta> = {
  assist: { label: 'Assistências', Icon: Wrench },
  index: { label: 'Início', Icon: Home },
  devices: { label: 'Monitoramento', Icon: MonitorDot },
  profile: { label: 'Perfil', Icon: User },
};

const ORDER = ['assist', 'index', 'devices', 'profile'];

/**
 * Bottom tab bar recreating the prototype's `Nav`: surface bar with a top
 * border; active tab shows a brand-soft chip behind the icon and brand-colored
 * icon + label.
 */
export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <XStack
      ai="flex-end"
      jc="space-around"
      bg="$surface"
      borderTopWidth={1}
      borderTopColor="$border"
      pt="$9"
      px="$12"
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
            gap="$4"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            cursor="pointer"
          >
            <View
              width={46}
              height={28}
              br={11}
              ai="center"
              jc="center"
              bg={focused ? '$brandSoft' : 'transparent'}
              animation="quick"
            >
              <Icon size={22} color={color} />
            </View>
            <Text
              fontSize="$9.5"
              fontWeight={focused ? '700' : '600'}
              color={color}
            >
              {meta.label}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
}
