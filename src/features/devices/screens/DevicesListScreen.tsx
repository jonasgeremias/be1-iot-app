import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, XStack, YStack } from 'tamagui';

import { ErrorState } from '@/shared/components/ErrorState';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { SearchInput } from '@/shared/components/SearchInput';
import { SectionTitle } from '@/shared/components/SectionTitle';
import { Screen } from '@/shared/layouts/Screen';
import { IconButton } from '@/shared/ui/IconButton';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { MonoText, Text } from '@/shared/ui/Text';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { useAppStore } from '@/store/app.store';

import { DeviceCard } from '../components/DeviceCard';
import { DeviceFilterChips } from '../components/DeviceFilterChips';
import { useDevices } from '../hooks/useDevices';
import type { DeviceGroup, DeviceListItem } from '../schemas/device.schema';

type ViewMode = 'cards' | 'tabela';

/** Device list · groups (screen 03). */
export function DevicesListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const filter = useAppStore((s) => s.activeDeviceFilter);
  const setFilter = useAppStore((s) => s.setActiveDeviceFilter);

  const { groups, totalShown, isLoading, isError, refetch, data } =
    useDevices(search, filter);

  const onlineCount = useMemo(
    () =>
      (data ?? [])
        .flatMap((g: DeviceGroup) => g.devices)
        .filter((d: DeviceListItem) => d.status === 'online').length,
    [data],
  );
  const totalCount = useMemo(
    () => (data ?? []).reduce((acc: number, g: DeviceGroup) => acc + g.total, 0),
    [data],
  );

  return (
    <Screen scroll tabBarSpacing>
      {/* Header */}
      <XStack px="$16" pt="$4" pb="$12" ai="center" jc="space-between">
        <XStack ai="center" gap="$12">
          <IconButton
            accessibilityLabel="Voltar"
            onPress={() => router.push('/(main)')}
          >
            <ChevronLeft size={19} color="$text" />
          </IconButton>
          <YStack>
            <Text fontSize="$20" fontWeight="800" color="$text" letterSpacing={-0.3}>
              Dispositivos
            </Text>
            <Text fontSize="$11" color="$text3">
              {(data ?? []).length} grupos · {totalCount} no total
            </Text>
          </YStack>
        </XStack>
        <View
          width={42}
          height={42}
          br={21}
          borderWidth={2.5}
          borderColor="$brand"
          ai="center"
          jc="center"
        >
          <MonoText fontSize="$13" fontWeight="800" color="$brand">
            {onlineCount}
          </MonoText>
        </View>
      </XStack>

      <YStack px="$16" mb="$11">
        <SearchInput value={search} onChangeText={setSearch} />
      </YStack>

      <YStack px="$16" mb="$12">
        <DeviceFilterChips value={filter} onChange={setFilter} />
      </YStack>

      {/* Body */}
      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <LoadingState />
      ) : totalShown === 0 ? (
        <EmptyState
          title="Nenhum dispositivo"
          description="Ajuste a busca ou os filtros para ver seus dispositivos."
        />
      ) : (
        <YStack px="$16" gap="$11">
          {groups.map((group) => (
            <YStack key={group.id} gap="$11">
              <XStack ai="center" jc="space-between">
                <SectionTitle>{`${group.name} · ${group.total}`}</SectionTitle>
                <SegmentedControl<ViewMode>
                  variant="pill"
                  value={viewMode}
                  onChange={setViewMode}
                  options={[
                    { value: 'cards', label: 'Cards' },
                    { value: 'tabela', label: 'Tabela' },
                  ]}
                />
              </XStack>
              {group.devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onPress={() => router.push(`/device/${device.id}`)}
                />
              ))}
            </YStack>
          ))}
        </YStack>
      )}
    </Screen>
  );
}
