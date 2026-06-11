import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { useTheme } from 'tamagui';

type Props = {
  children?: ReactNode;
  /** Theme color keys for the two gradient stops. */
  from?: 'brandGrad1' | 'brand' | 'brandGrad2';
  to?: 'brandGrad2' | 'brand2' | 'brandGrad1';
  /** Gradient direction (defaults to the prototype's ~145° diagonal). */
  start?: [number, number];
  end?: [number, number];
  style?: ViewStyle;
};

/**
 * Brand gradient surface. Gradient stops still come from theme tokens
 * (`brandGrad1`/`brandGrad2`), so color stays token-driven even though RN
 * gradients can't be expressed as plain Tamagui style props.
 */
export function BrandGradient({
  children,
  from = 'brandGrad1',
  to = 'brandGrad2',
  start = [0.1, 0],
  end = [0.9, 1],
  style,
}: Props) {
  const theme = useTheme();
  const colors: [string, string] = [theme[from].get(), theme[to].get()];
  return (
    <LinearGradient colors={colors} start={start} end={end} style={style}>
      {children}
    </LinearGradient>
  );
}
