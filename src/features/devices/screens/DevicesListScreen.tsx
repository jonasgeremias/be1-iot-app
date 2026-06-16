import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { useDebounce } from '@/hooks/useDebounce';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { ProfileButton } from '@/shared/components/ProfileButton';
import { SearchInput } from '@/shared/components/SearchInput';
import { Screen } from '@/shared/layouts/Screen';
import { Text } from '@/shared/ui/Text';

import { CircularCountdown } from '../components/CircularCountdown';
import { GroupSection } from '../components/GroupSection';
import { useIotDevices } from '../hooks/useIotDevices';
import { LATEST_CARD_POLL_MS } from '../hooks/useIotLatestData';
import { useRefetchCountdown } from '../hooks/useRefetchCountdown';
import { useRefreshIotDevices } from '../hooks/useRefreshIotDevices';
import type { IotGroupedEntry } from '../schemas/device.schema';
import { deviceMatchesSearch } from '../utils/iotConstants';

/** Device monitoring list · grouped by facility (be1-app MonitoringList). */
export function DevicesListScreen() {
  const router = useRouter();
  const refreshNow = useRefreshIotDevices();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

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

  // Devices actually visible under the current search (drives the empty state).
  const visibleCount = useMemo(
    () =>
      sortedEntries.reduce(
        (acc, [, e]) =>
          acc + e.devices.filter((d) => deviceMatchesSearch(d, debouncedSearch)).length,
        0,
      ),
    [sortedEntries, debouncedSearch],
  );

  return (
    <Screen scroll tabBarSpacing>
      <YStack px="$16" pt="$4" pb="$12">
        <XStack ai="center" jc="space-between">
          <Text fontSize="$20" fontWeight="800" color="$text" letterSpacing={-0.3}>
            Monitoramento
          </Text>
          <XStack ai="center" gap="$12">
            <CircularCountdown
              secondsLeft={secondsLeft}
              totalSeconds={totalSeconds}
              progress={progress}
              clickDelaySec={0}
              onPress={refreshNow}
            />
            <ProfileButton />
          </XStack>
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
      ) : visibleCount === 0 ? (
        <EmptyState
          title="Nenhum resultado"
          description={`Nada encontrado para “${debouncedSearch.trim()}”.`}
        />
      ) : (
        <YStack px="$16">
          {sortedEntries.map(([key, entry]) => (
            <GroupSection
              key={key}
              entry={entry}
              searchQuery={debouncedSearch}
              onDevicePress={(device) => router.push(`/device/${device.id}`)}
            />
          ))}
        </YStack>
      )}
    </Screen>
  );
}
