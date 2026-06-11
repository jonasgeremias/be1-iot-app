import { View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import { formatIotReadingDate } from '../utils/iotDates';
import { getReadingStatus } from '../utils/iotConstants';
import { CircularCountdown } from './CircularCountdown';

type Props = {
  lastReading: Date | null;
  deviceStatus: string | undefined;
  secondsLeft: number;
  totalSeconds: number;
  progress: number;
  onRefetch: () => void;
};

/** "Última leitura" + countdown ring | reading status — be1-app BulkLastReadingBar. */
export function BulkLastReadingBar({
  lastReading,
  deviceStatus,
  secondsLeft,
  totalSeconds,
  progress,
  onRefetch,
}: Props) {
  const reading = getReadingStatus(lastReading, deviceStatus);

  return (
    <Card br={8} elevated={false} mt="$12">
      <XStack ai="center" jc="space-between" px="$12" py="$8">
        <XStack ai="center" gap="$8" flex={1} minWidth={0}>
          <CircularCountdown
            secondsLeft={secondsLeft}
            totalSeconds={totalSeconds}
            progress={progress}
            onPress={onRefetch}
          />
          <YStack flex={1} minWidth={0}>
            <Text fontSize={11} color="$text2">
              Última leitura
            </Text>
            <Text fontSize={13} fontWeight="600" color="$text" numberOfLines={1}>
              {lastReading ? formatIotReadingDate(lastReading) : '—'}
            </Text>
          </YStack>
        </XStack>

        <XStack ai="center" gap="$6">
          <View width={8} height={8} br={4} bg={reading.color} />
          <Text fontSize={13} fontWeight="700" color={reading.color}>
            {reading.label}
          </Text>
        </XStack>
      </XStack>
    </Card>
  );
}
