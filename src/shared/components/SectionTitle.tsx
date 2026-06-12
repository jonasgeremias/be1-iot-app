import { Text } from '@/shared/ui/Text';

/** Uppercase section label (e.g. "LABORATÓRIO · 8", "SETPOINTS"). */
type Props = {
  children: string;
  letterSpacing?: number;
  color?: '$text2' | '$text3';
};

export function SectionTitle({ children, letterSpacing = 1, color = '$text2' }: Props) {
  return (
    <Text fontSize="$11" fontWeight="800" color={color} letterSpacing={letterSpacing}>
      {children}
    </Text>
  );
}
