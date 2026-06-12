import { View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { Text } from '@/shared/ui/Text';

import { useIotLatestData, LATEST_CARD_POLL_MS } from '../hooks/useIotLatestData';
import type { IotDevice } from '../schemas/device.schema';
import { getCb200Snapshot, getSccChambers } from '../utils/latestData';
import { formatIotReadingDate } from '../utils/iotDates';
import { formatMac, getReadingStatus, getStatusLabel } from '../utils/iotConstants';
import { BulkCardSnapshot } from './BulkCardSnapshot';
import { MiniSccPreview } from './MiniSccPreview';

const PREVIEW_W = 150;

type Props = {
  device: IotDevice;
  onPress: () => void;
};

/** Device list card with type-specific live preview — be1-app DeviceCard. */
export function DeviceCard({ device, onPress }: Props) {
  const primaryLabel = device.nickname || formatMac(device.macAddress);
  const showMac = !!device.nickname;

  // Card-level real-time polling (be1-app §3.2).
  const { latestData, lastFetch, isLoading } = useIotLatestData(
    device.id,
    LATEST_CARD_POLL_MS,
  );

  const reading = getReadingStatus(lastFetch, device.status);
  const status = getStatusLabel(device.status);

  const isScc = device.deviceType === 'SCC';
  const isBulkLike = device.deviceType === 'PP' || device.deviceType === 'BULK';

  const preview = isScc ? (
    <MiniSccPreview chambers={getSccChambers(latestData)} isLoading={isLoading} />
  ) : isBulkLike ? (
    <BulkCardSnapshot snapshot={getCb200Snapshot(latestData)} isLoading={isLoading} />
  ) : (
    <Text fontSize={10} color="$text3" ta="center">
      Visualização indisponível
    </Text>
  );

  return (
    <Card
      br={14}
      my="$5"
      onPress={onPress}
      pressStyle={{ opacity: 0.9, scale: 0.995 }}
      cursor="pointer"
      accessibilityRole="button"
      accessibilityLabel={`Dispositivo ${primaryLabel}, ${reading.label}`}
    >
      {/* status pill */}
      <XStack
        position="absolute"
        top={10}
        right={12}
        zIndex={2}
        ai="center"
        gap="$5"
        px="$8"
        py="$3"
        br={12}
        bg={reading.color + '22'}
      >
        <View width={6} height={6} br={3} bg={reading.color} />
        <Text fontSize={12} fontWeight="700" color={reading.color}>
          {reading.label}
        </Text>
      </XStack>

      {/* preview + title */}
      <XStack width="100%">
        <View
          width={PREVIEW_W}
          bg="$surface2"
          ai="center"
          jc="center"
          py={isBulkLike ? 12 : 16}
          px={isBulkLike ? 10 : 4}
          borderRightWidth={1}
          borderRightColor="$border"
        >
          {preview}
        </View>

        <YStack flex={1} px="$14" py="$12" jc="center">
          <Text fontSize={15} fontWeight="600" color="$text" numberOfLines={1}>
            {primaryLabel}
          </Text>
          {lastFetch ? (
            <Text fontSize={12} color="$text3" mt="$4">
              {formatIotReadingDate(lastFetch)}
            </Text>
          ) : null}
        </YStack>
      </XStack>

      <View height={1} bg="$border" width="100%" />

      {/* chips */}
      <XStack width="100%" px="$14" py="$10" gap="$6" flexWrap="wrap">
        <Chip tone="brand" label={device.deviceType} />
        <Chip tone={status.tone} label={status.label} />
        {showMac ? (
          <Chip tone="neutral" mono label={formatMac(device.macAddress)} />
        ) : null}
      </XStack>
    </Card>
  );
}
