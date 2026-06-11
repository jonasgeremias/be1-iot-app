import { XStack, View } from 'tamagui';

import { Text } from './Text';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * 'pill'  → inset track, active segment is a raised surface (Cards/Tabela, 6h/24h…)
   * 'solid' → full-width tabs, active segment is brand-filled (Hoje/7 dias…)
   */
  variant?: 'pill' | 'solid';
};

/** Generic segmented selector covering the prototype's several tab strips. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'pill',
}: Props<T>) {
  if (variant === 'solid') {
    return (
      <XStack gap="$5" flex={1}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <View
              key={opt.value}
              flex={1}
              ai="center"
              py="$8"
              br={10}
              bg={active ? '$brand' : 'transparent'}
              onPress={() => onChange(opt.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={opt.label}
              cursor="pointer"
            >
              <Text
                fontSize="$12"
                fontWeight={active ? '700' : '600'}
                color={active ? '$white' : '$text2'}
              >
                {opt.label}
              </Text>
            </View>
          );
        })}
      </XStack>
    );
  }

  return (
    <XStack bg="$surface3" br={9} p="$3" gap="$2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <View
            key={opt.value}
            px="$10"
            py="$4"
            br={7}
            bg={active ? '$surface' : 'transparent'}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
            cursor="pointer"
            {...(active
              ? {
                  shadowColor: '$shadowColor',
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                }
              : {})}
          >
            <Text
              fontSize="$11"
              fontWeight={active ? '700' : '600'}
              color={active ? '$text' : '$text3'}
            >
              {opt.label}
            </Text>
          </View>
        );
      })}
    </XStack>
  );
}
