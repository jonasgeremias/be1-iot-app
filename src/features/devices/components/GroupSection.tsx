import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { View, XStack, YStack } from 'tamagui';

import { MonoText, Text } from '@/shared/ui/Text';

import type { IotDevice, IotGroupedEntry } from '../schemas/device.schema';
import { deviceMatchesSearch } from '../utils/iotConstants';
import { DeviceCard } from './DeviceCard';

type Props = {
  entry: IotGroupedEntry;
  searchQuery: string;
  onDevicePress: (device: IotDevice) => void;
};

/** Collapsible facility group — be1-app GroupSection. */
export function GroupSection({ entry, searchQuery, onDevicePress }: Props) {
  const [expanded, setExpanded] = useState(true);

  const filtered = entry.devices.filter((d) =>
    deviceMatchesSearch(d, searchQuery),
  );

  if (filtered.length === 0) return null;

  const groupName = entry.group?.name ?? 'Sem planta';
  const responsible = entry.group?.responsible;
  // Keep groups open while searching so matches stay visible.
  const isOpen = expanded || !!searchQuery;

  return (
    <YStack mb="$20">
      <XStack
        ai="flex-end"
        jc="space-between"
        px="$4"
        pb="$8"
        mb="$4"
        borderBottomWidth={1}
        borderBottomColor="$border"
        onPress={searchQuery ? undefined : () => setExpanded((p) => !p)}
        pressStyle={searchQuery ? undefined : { opacity: 0.7 }}
        cursor={searchQuery ? undefined : 'pointer'}
      >
        <YStack flex={1}>
          <Text
            fontSize={13}
            fontWeight="700"
            color="$brand"
            textTransform="uppercase"
            letterSpacing={0.6}
          >
            {groupName}
          </Text>
          {responsible ? (
            <Text fontSize={11} color="$text3" mt="$1">
              {responsible}
            </Text>
          ) : null}
        </YStack>

        <XStack ai="center" gap="$6">
          <View bg="$brandSoft" br={10} px="$8" py="$2">
            <MonoText fontSize={11} fontWeight="700" color="$brand">
              {filtered.length}
            </MonoText>
          </View>
          {isOpen ? (
            <ChevronUp size={20} color="$brand" />
          ) : (
            <ChevronDown size={20} color="$brand" />
          )}
        </XStack>
      </XStack>

      {isOpen
        ? filtered.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onPress={() => onDevicePress(device)}
            />
          ))
        : null}
    </YStack>
  );
}
