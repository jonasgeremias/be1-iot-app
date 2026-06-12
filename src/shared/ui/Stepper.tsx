import { XStack, View } from 'tamagui';

import { MonoText, Text } from './Text';

/**
 * Numeric stepper (− value +) — temperature/humidity setpoints on the device
 * config screen. Display value is formatted by the caller (e.g. "80°C").
 */
type Props = {
  displayValue: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  accessibilityLabel: string;
};

export function Stepper({ displayValue, onIncrement, onDecrement, accessibilityLabel }: Props) {
  return (
    <XStack
      ai="center"
      borderWidth={1}
      borderColor="$border"
      br={11}
      overflow="hidden"
      bg="$surface2"
      accessibilityLabel={accessibilityLabel}
    >
      <View
        width={34}
        height={36}
        ai="center"
        jc="center"
        onPress={onDecrement}
        accessibilityRole="button"
        accessibilityLabel="Diminuir"
        cursor="pointer"
        pressStyle={{ opacity: 0.6 }}
      >
        <Text color="$brand" fontSize="$19" fontWeight="700">
          −
        </Text>
      </View>
      <MonoText minWidth={60} ta="center" fontSize="$14" fontWeight="800" color="$text">
        {displayValue}
      </MonoText>
      <View
        width={34}
        height={36}
        ai="center"
        jc="center"
        onPress={onIncrement}
        accessibilityRole="button"
        accessibilityLabel="Aumentar"
        cursor="pointer"
        pressStyle={{ opacity: 0.6 }}
      >
        <Text color="$brand" fontSize="$18" fontWeight="700">
          +
        </Text>
      </View>
    </XStack>
  );
}
