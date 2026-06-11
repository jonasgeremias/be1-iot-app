import { XStack, View } from 'tamagui';

/** Carousel page dots (active dot widens to 18px), drawn over a gradient. */
type Props = {
  count: number;
  active: number;
  onSelect?: (index: number) => void;
};

export function DotIndicator({ count, active, onSelect }: Props) {
  return (
    <XStack gap="$5" ai="center">
      {Array.from({ length: count }).map((_, i) => {
        const on = i === active;
        return (
          <View
            key={i}
            height={6}
            width={on ? 18 : 6}
            br={3}
            bg={on ? '$white' : '$whiteA45'}
            animation="quick"
            onPress={() => onSelect?.(i)}
            accessibilityRole="button"
            accessibilityLabel={`Ir para slide ${i + 1}`}
            cursor="pointer"
          />
        );
      })}
    </XStack>
  );
}
