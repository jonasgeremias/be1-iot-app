import { useEffect } from 'react';
import { Image } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { View } from 'tamagui';

const logo = require('@/assets/images/be1-white.png');

/** A single expanding ring (`be1ring`: scale 0.5→2.4, opacity 0.55→0). */
function Ring({ delay }: { delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2800, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.5 + progress.value * 1.9 }],
    opacity: 0.55 * (1 - Math.min(1, progress.value / 0.8)),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 130,
          height: 130,
          borderRadius: 65,
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.45)',
        },
        style,
      ]}
    />
  );
}

/** Splash logo: expanding rings + glow + floating BE1 mark (`be1float`). */
export function SplashLogo() {
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -7 * float.value }],
  }));

  return (
    <View width={210} height={210} ai="center" jc="center" position="relative">
      <Ring delay={0} />
      <Ring delay={900} />
      <Ring delay={1800} />
      <Animated.View style={floatStyle}>
        <Image
          source={logo}
          style={{ width: 122, height: 122, resizeMode: 'contain' }}
          accessibilityLabel="BE1"
        />
      </Animated.View>
    </View>
  );
}
