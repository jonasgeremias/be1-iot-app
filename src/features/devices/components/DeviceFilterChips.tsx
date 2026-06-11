import { XStack, View } from 'tamagui';

import { Text } from '@/shared/ui/Text';

import type { DeviceFilter } from '../hooks/useDevices';

type ChipDef = {
  value: DeviceFilter;
  label: string;
  dot?: '$online' | '$red';
};

const CHIPS: ChipDef[] = [
  { value: 'all', label: 'Todos' },
  { value: 'online', label: 'Online', dot: '$online' },
  { value: 'offline', label: 'Offline', dot: '$red' },
  { value: 'alert', label: 'Alerta' },
];

/** Status filter pills (screen 03). Active pill is brand-filled. */
export function DeviceFilterChips({
  value,
  onChange,
}: {
  value: DeviceFilter;
  onChange: (value: DeviceFilter) => void;
}) {
  return (
    <XStack gap="$8">
      {CHIPS.map((chip) => {
        const active = chip.value === value;
        return (
          <XStack
            key={chip.value}
            ai="center"
            gap="$6"
            px="$13"
            py="$7"
            br={10}
            bg={active ? '$brand' : '$surface'}
            borderWidth={active ? 0 : 1}
            borderColor="$border"
            onPress={() => onChange(chip.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Filtrar ${chip.label}`}
            cursor="pointer"
          >
            {chip.dot && !active ? (
              <View width={7} height={7} br={4} bg={chip.dot} />
            ) : null}
            <Text
              fontSize="$12"
              fontWeight={active ? '700' : '600'}
              color={active ? '$white' : '$text2'}
            >
              {chip.label}
            </Text>
          </XStack>
        );
      })}
    </XStack>
  );
}
