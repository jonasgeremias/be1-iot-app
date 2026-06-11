import { View } from 'tamagui';

/**
 * Toggle switch — the "Lembrar acesso", soprador automático and 2FA toggles.
 * Two sizes match the prototype (38×22 and 42×24). Controlled; knob slides.
 */
type Props = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  size?: 'sm' | 'md';
  /** Track color when on (defaults to brand; 2FA row uses online). */
  onColor?: '$brand' | '$online';
  accessibilityLabel: string;
};

const DIMS = {
  sm: { w: 38, h: 22, knob: 18, pad: 2 },
  md: { w: 42, h: 24, knob: 20, pad: 2 },
} as const;

export function Switch({
  value,
  onValueChange,
  size = 'md',
  onColor = '$brand',
  accessibilityLabel,
}: Props) {
  const d = DIMS[size];
  const offX = d.pad;
  const onX = d.w - d.knob - d.pad;
  return (
    <View
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onValueChange?.(!value)}
      width={d.w}
      height={d.h}
      br={d.h / 2}
      bg={value ? onColor : '$surface3'}
      borderWidth={value ? 0 : 1}
      borderColor="$border2"
      position="relative"
      cursor="pointer"
    >
      <View
        position="absolute"
        top={d.pad}
        left={value ? onX : offX}
        width={d.knob}
        height={d.knob}
        br={d.knob / 2}
        bg="$white"
        animation="quick"
        shadowColor="$black"
        shadowOpacity={0.25}
        shadowRadius={3}
        shadowOffset={{ width: 0, height: 1 }}
      />
    </View>
  );
}
