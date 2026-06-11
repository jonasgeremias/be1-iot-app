import { XStack, View, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { MonoText, Text } from '@/shared/ui/Text';

import type { DeviceDetail, DeviceStatus } from '../schemas/device.schema';

/** "Última leitura" banner with the reading-cycle ring and status badge. */
export function LastReadingBanner({
  cycle,
  label,
  status,
}: {
  cycle: DeviceDetail['cycle'];
  label: string;
  status: DeviceStatus;
}) {
  return (
    <Card radius={15} elevated p="$11" px="$13">
      <XStack ai="center" gap="$12">
        <View
          width={40}
          height={40}
          br={20}
          borderWidth={2.5}
          borderColor="$brand"
          ai="center"
          jc="center"
        >
          <MonoText fontSize="$12" fontWeight="800" color="$brand">
            {cycle}
          </MonoText>
        </View>
        <YStack flex={1}>
          <Text fontSize="$11" color="$text3" fontWeight="500">
            Última leitura
          </Text>
          <Text fontSize="$14.5" fontWeight="800" color="$text">
            {label}
          </Text>
        </YStack>
        <StatusBadge status={status} size="md" />
      </XStack>
    </Card>
  );
}
