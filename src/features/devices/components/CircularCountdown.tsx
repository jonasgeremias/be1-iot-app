import { Circle, Svg } from 'react-native-svg';
import { View } from 'tamagui';

import { MonoText } from '@/shared/ui/Text';

type Props = {
  secondsLeft: number;
  totalSeconds: number;
  /** 1 → full, 0 → empty. */
  progress: number;
  size?: number;
  color?: string;
  onPress?: () => void;
  /** Clickable (force refetch) only after this many seconds elapsed. */
  clickDelaySec?: number;
};

const BRAND = '#1366C9';

/** Countdown ring around the next poll — be1-app CircularCountdown. */
export function CircularCountdown({
  secondsLeft,
  totalSeconds,
  progress,
  size = 24,
  color = BRAND,
  onPress,
  clickDelaySec = 3,
}: Props) {
  const strokeWidth = 2.5;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const elapsed = totalSeconds - secondsLeft;
  const canClick = !!onPress && elapsed >= clickDelaySec;

  return (
    <View
      width={size}
      height={size}
      onPress={canClick ? onPress : undefined}
      pressStyle={canClick ? { opacity: 0.6 } : undefined}
      cursor={canClick ? 'pointer' : undefined}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#E5EBF3"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, progress)))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        ai="center"
        jc="center"
      >
        <MonoText fontSize={9} fontWeight="700" color={color}>
          {secondsLeft}
        </MonoText>
      </View>
    </View>
  );
}
