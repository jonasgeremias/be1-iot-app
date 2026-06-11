import { XStack } from 'tamagui';

import { MonoText, Text } from '@/shared/ui/Text';

import type { ReportEvent } from '../schemas/report.schema';

const LEVEL = {
  AVISO: { bg: '$amberSoft', color: '$amber' },
  CRÍTICO: { bg: '$redSoft', color: '$red' },
  INFO: { bg: '$brandSoft', color: '$brand' },
} as const;

/** One row in "Histórico de eventos": level badge + code + time. */
export function EventRow({ event }: { event: ReportEvent }) {
  const level = LEVEL[event.level];
  return (
    <XStack ai="center" gap="$10">
      <XStack bg={level.bg} px="$7" py="$3" br={6} flexShrink={0}>
        <Text fontSize="$9" fontWeight="800" color={level.color}>
          {event.level}
        </Text>
      </XStack>
      <MonoText flex={1} fontSize="$11" color="$text" minWidth={0}>
        {event.code}
      </MonoText>
      <MonoText fontSize="$10" color="$text3">
        {event.time}
      </MonoText>
    </XStack>
  );
}
