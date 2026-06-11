import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from 'tamagui';

import type { AppTheme } from '@/theme/themes';

type Props = {
  /** Theme color key (e.g. 'online', 'red', 'amber'). */
  color?: keyof AppTheme;
  size?: number;
  /** Animate the `be1pulse` opacity loop (used on live/online dots). */
  pulse?: boolean;
};

/** Status dot, optionally looping the prototype's `be1pulse` opacity fade. */
export function PulseDot({ color = 'online', size = 6, pulse = false }: Props) {
  const theme = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!pulse) return;
    opacity.value = withRepeat(
      withTiming(0.35, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme[color]?.get() ?? theme.online.get(),
        },
        pulse ? animatedStyle : undefined,
      ]}
    />
  );
}
