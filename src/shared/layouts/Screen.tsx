import type { ReactNode } from 'react';
import { ScrollView, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Standard screen frame: themed background + top safe-area padding. The
 * prototype phone frames are 370px tall content areas on `var(--bg)`; on device
 * this fills the screen. Use `scroll` for long content (device detail, history).
 */
type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Background token (defaults to app bg; gradient screens pass their own). */
  bg?: '$bg' | '$surface' | '$canvas';
  /** Pad the bottom for a floating tab bar. */
  tabBarSpacing?: boolean;
  edges?: { top?: boolean; bottom?: boolean };
};

export function Screen({
  children,
  scroll = false,
  bg = '$bg',
  tabBarSpacing = false,
  edges = { top: true, bottom: false },
}: Props) {
  const insets = useSafeAreaInsets();
  const pt = edges.top ? insets.top : 0;
  const pb = (edges.bottom ? insets.bottom : 0) + (tabBarSpacing ? 12 : 0);

  if (scroll) {
    return (
      <YStack flex={1} bg={bg} pt={pt}>
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: pb + 14 }}
        >
          {children}
        </ScrollView>
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg={bg} pt={pt} pb={pb}>
      {children}
    </YStack>
  );
}
