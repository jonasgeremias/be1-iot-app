import { XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { MonoText, Text } from '@/shared/ui/Text';
import { StatusBadge } from '@/shared/ui/StatusBadge';

import type { DeviceListItem } from '../schemas/device.schema';
import { DeviceMiniGrid } from './DeviceMiniGrid';

/** Device list card (screen 03). */
export function DeviceCard({
  device,
  onPress,
}: {
  device: DeviceListItem;
  onPress?: () => void;
}) {
  return (
    <Card
      radius={18}
      elevated
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Dispositivo ${device.name}, ${device.status}`}
      pressStyle={{ opacity: 0.96 }}
    >
      <XStack gap="$12" p="$13" ai="center">
        <DeviceMiniGrid
          mainTemp={device.mainTemp}
          mainTone={device.mainTone}
          chambers={device.chambers}
        />
        <YStack flex={1} minWidth={0}>
          <XStack ai="center" jc="space-between" gap="$8">
            <Text fontSize="$14.5" fontWeight="800" color="$text">
              {device.name}
            </Text>
            <StatusBadge status={device.status} />
          </XStack>
          <MonoText fontSize="$11" color="$text3" mt="$2">
            {device.updatedLabel}
          </MonoText>
          <XStack gap="$12" mt="$9">
            <Text fontSize="$11.5" color="$text2" fontWeight="600">
              Temp{' '}
              <MonoText fontSize="$11.5" color="$text" fontWeight="700">
                {device.temp}°
              </MonoText>
            </Text>
            <Text fontSize="$11.5" color="$text2" fontWeight="600">
              Umid{' '}
              <MonoText fontSize="$11.5" color="$text" fontWeight="700">
                {device.humidity}%
              </MonoText>
            </Text>
            <Text
              fontSize="$11.5"
              fontWeight="700"
              color={device.blowerOn ? '$online' : '$text3'}
            >
              Soprador {device.blowerOn ? 'ON' : 'OFF'}
            </Text>
          </XStack>
        </YStack>
      </XStack>
      <XStack gap="$6" px="$13" pb="$12" flexWrap="wrap" ai="center">
        <Chip tone="brand" label={device.model} fontWeight="800" />
        <Chip tone="online" label={device.active ? 'Ativo' : 'Inativo'} />
        <Chip tone="neutral" label={device.mac} mono fontWeight="600" />
      </XStack>
    </Card>
  );
}
