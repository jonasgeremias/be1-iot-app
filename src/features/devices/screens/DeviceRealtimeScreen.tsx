import { Pencil } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { XStack, YStack } from 'tamagui';

import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Chip } from '@/shared/ui/Chip';
import { IconButton } from '@/shared/ui/IconButton';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { Text } from '@/shared/ui/Text';

import { AlarmBanner } from '../components/AlarmBanner';
import { GaugePanel } from '../components/GaugePanel';
import { HistoryCard } from '../components/HistoryCard';
import { LastReadingBanner } from '../components/LastReadingBanner';
import { PhaseClimateCard } from '../components/PhaseClimateCard';
import { PlantaCard } from '../components/PlantaCard';
import { SopradorCard } from '../components/SopradorCard';
import { VariationChart } from '../components/VariationChart';
import { useDevice } from '../hooks/useDevice';
import { useDeviceRealtime } from '../hooks/useDeviceRealtime';

/** Device detail · real-time (screen 04). */
export function DeviceRealtimeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useDevice(deviceId);
  useDeviceRealtime(deviceId);

  if (isError) {
    return (
      <Screen tabBarSpacing>
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }

  if (isLoading || !data) {
    return (
      <Screen tabBarSpacing>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarSpacing>
      {/* Header */}
      <XStack px="$16" pt="$4" pb="$8" ai="center" gap="$12">
        <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={19} color="$text" />
        </IconButton>
        <YStack flex={1} minWidth={0}>
          <Text fontSize="$19" fontWeight="800" color="$text" letterSpacing={-0.3}>
            {data.name}
          </Text>
        </YStack>
        <IconButton accessibilityLabel="Editar dispositivo" tone="brandSoft">
          <Pencil size={17} color="$brand" />
        </IconButton>
      </XStack>

      {/* Meta chips */}
      <XStack px="$16" pb="$12" gap="$6" flexWrap="wrap">
        <Chip tone="brand" label={`MODELO · ${data.model}`} fontWeight="800" px="$9" />
        <Chip
          tone={data.status === 'online' ? 'online' : 'red'}
          label={data.status === 'online' ? 'ATIVO' : 'OFFLINE'}
          fontWeight="800"
          px="$9"
        />
        <Chip tone="neutral" label={data.mac} mono fontWeight="600" px="$9" />
      </XStack>

      <YStack px="$16" gap="$11">
        <LastReadingBanner
          cycle={data.cycle}
          label={data.lastReadingLabel}
          status={data.status}
        />
        <PlantaCard chambersLabel={`${data.chambers.length} câmaras`} />
        <VariationChart chambers={data.chambers} />
        <GaugePanel model="CB200" temp={data.temp} humidity={data.humidity} />
        <SopradorCard on={data.blowerOn} />
        <PhaseClimateCard phase={data.phase} climate={data.climate} />
        <AlarmBanner hasAlarms={data.hasAlarms} />
        <HistoryCard />
      </YStack>
    </Screen>
  );
}
