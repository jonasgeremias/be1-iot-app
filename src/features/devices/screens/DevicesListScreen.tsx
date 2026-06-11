import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { SearchInput } from '@/shared/components/SearchInput';
import { Screen } from '@/shared/layouts/Screen';
import { Text } from '@/shared/ui/Text';

import { CircularCountdown } from '../components/CircularCountdown';
import { GroupSection } from '../components/GroupSection';
import type { IotGroupedEntry } from '../schemas/device.schema';
import { useIotDevices } from '../hooks/useIotDevices';
import { LATEST_CARD_POLL_MS } from '../hooks/useIotLatestData';
import { useRefetchCountdown } from '../hooks/useRefetchCountdown';

/** Device monitoring list · grouped by facility (be1-app MonitoringList). */
export function DevicesListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { grouped, isLoading, isError, refetch, dataUpdatedAt } =
    useIotDevices(LATEST_CARD_POLL_MS);

  // Countdown to the next 30s poll (be1-app parity).
  const { secondsLeft, totalSeconds, progress } = useRefetchCountdown(
    LATEST_CARD_POLL_MS,
    dataUpdatedAt,
  );

  // Named groups first, "ungrouped" last.
  const sortedEntries = useMemo<[string, IotGroupedEntry][]>(() => {
    if (!grouped) return [];
    const entries = Object.entries(grouped) as [string, IotGroupedEntry][];
    return [
      ...entries.filter(([k]) => k !== 'ungrouped'),
      ...entries.filter(([k]) => k === 'ungrouped'),
    ];
  }, [grouped]);

  const hasAnyDevices = sortedEntries.some(([, e]) => e.devices.length > 0);

  return (
    <Screen scroll tabBarSpacing>
      <YStack px="$16" pt="$4" pb="$12">
        <XStack ai="center" jc="space-between">
          <Text fontSize="$20" fontWeight="800" color="$text" letterSpacing={-0.3}>
            Monitoramento
          </Text>
          <CircularCountdown
            secondsLeft={secondsLeft}
            totalSeconds={totalSeconds}
            progress={progress}
            onPress={() => void refetch()}
          />
        </XStack>
        {hasAnyDevices ? (
          <YStack mt="$10">
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Pesquisar dispositivo…"
            />
          </YStack>
        ) : null}
      </YStack>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <LoadingState />
      ) : !hasAnyDevices ? (
        <EmptyState
          title="Nenhum dispositivo"
          description="Nenhum dispositivo encontrado para esta conta."
        />
      ) : (
        <YStack px="$16">
          {sortedEntries.map(([key, entry]) => (
            <GroupSection
              key={key}
              entry={entry}
              searchQuery={search}
              onDevicePress={(device) => router.push(`/device/${device.id}`)}
            />
          ))}
        </YStack>
      )}
    </Screen>
  );
}
