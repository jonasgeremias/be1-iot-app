import { Ban, ChevronLeft } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';

import { BulkDeviceHistory } from '../components/BulkDeviceHistory';
import { ChamberGrid } from '../components/ChamberGrid';
import { ChamberHistoryChart } from '../components/ChamberHistoryChart';
import { TimeRangePicker } from '../components/TimeRangePicker';
import { useIotDevice } from '../hooks/useIotDevice';
import { useIotDeviceHistory } from '../hooks/useIotDeviceHistory';
import { LATEST_CARD_POLL_MS, useIotLatestData } from '../hooks/useIotLatestData';
import { getSccChambers } from '../utils/latestData';
import { formatMac } from '../utils/iotConstants';
import {
  timeRangePresets,
  type TimeRangePresetOptions,
} from '../utils/timeRangePresets';

/** Device detail · histórico (gráficos) for SCC / PP / BULK. */
export function DeviceHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const { device, isLoading: isLoadingDevice } = useIotDevice(deviceId);
  const isScc = device?.deviceType === 'SCC';
  const isBulkLike = device?.deviceType === 'PP' || device?.deviceType === 'BULK';

  const [timeRangeOption, setTimeRangeOption] =
    useState<TimeRangePresetOptions>('1day');
  const [timeOffset, setTimeOffset] = useState(0);
  const timeRange = timeRangePresets[timeRangeOption];
  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const { latestData, lastFetch, isLoading: isLoadingLatest } = useIotLatestData(
    deviceId,
    isScc || isBulkLike ? LATEST_CARD_POLL_MS : undefined,
  );
  const sccChambers = getSccChambers(latestData);

  const { deviceHistory, isFetching: isFetchingHistory } = useIotDeviceHistory(
    isScc ? deviceId : '',
    timeRangeOption,
    timeOffset,
  );

  // auto-select first chamber
  useEffect(() => {
    if (!selectedChamber && sccChambers) {
      const first = Object.keys(sccChambers)
        .filter((k) => k !== '9')
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))[0];
      if (first) setSelectedChamber(first);
    }
  }, [sccChambers, selectedChamber]);

  const chamberHistory = selectedChamber
    ? (deviceHistory?.[selectedChamber] ?? [])
    : [];

  const moveTimeOffset = (move: 1 | -1) =>
    setTimeOffset((prev) => Math.max(0, prev + move));

  const handleGoToLastDataPeriod = useCallback(() => {
    if (!lastFetch) return;
    const preset = timeRangePresets[timeRangeOption];
    const target = lastFetch.getTime();
    let found = 0;
    for (let offset = 0; offset < 100; offset++) {
      const start = preset.getStart(offset);
      const end = preset.getEnd(offset) ?? new Date();
      if (!start) continue;
      if (target >= start.getTime() && target <= end.getTime()) {
        found = offset;
        break;
      }
    }
    setTimeOffset(found);
  }, [lastFetch, timeRangeOption]);

  const header = (
    <XStack px="$16" pt="$4" pb="$8" ai="center" gap="$12">
      <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
        <ChevronLeft size={19} color="$text" />
      </IconButton>
      <YStack flex={1} minWidth={0}>
        <Text fontSize="$19" fontWeight="800" color="$text" letterSpacing={-0.3}>
          Histórico
        </Text>
        {device ? (
          <Text fontSize="$11" color="$text3" numberOfLines={1}>
            {device.nickname || formatMac(device.macAddress)}
          </Text>
        ) : null}
      </YStack>
    </XStack>
  );

  if (isLoadingDevice && !device) {
    return (
      <Screen tabBarSpacing>
        {header}
        <LoadingState />
      </Screen>
    );
  }

  if (device && !isScc && !isBulkLike) {
    return (
      <Screen tabBarSpacing>
        {header}
        <YStack ai="center" jc="center" p="$32" gap="$12">
          <Ban size={44} color="$text3" />
          <Text fontSize={15} ta="center" color="$text2">
            Histórico não disponível para este tipo de dispositivo.
          </Text>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarSpacing>
      {header}

      <YStack px="$16" gap="$11">
        {isScc ? (
          <>
            <Text fontSize={12} color="$text2" fontWeight="600">
              Selecione a câmara
            </Text>
            <ChamberGrid
              latestData={sccChambers}
              isLoading={isLoadingLatest}
              selectedChamber={selectedChamber}
              onSelectChamber={setSelectedChamber}
            />
            <ChamberHistoryChart
              chamberHistory={chamberHistory}
              isFetching={isFetchingHistory}
              selectedChamber={selectedChamber}
              timeRange={timeRange}
              timeOffset={timeOffset}
              onMoveOffset={moveTimeOffset}
              onResetOffset={() => setTimeOffset(0)}
              onOpenPicker={() => setShowPicker(true)}
              onGoToLastDataPeriod={handleGoToLastDataPeriod}
            />
          </>
        ) : (
          <BulkDeviceHistory deviceId={deviceId} referenceDate={lastFetch} />
        )}
      </YStack>

      <TimeRangePicker
        visible={showPicker}
        selected={timeRangeOption}
        onClose={() => setShowPicker(false)}
        onSelect={(opt) => {
          setTimeRangeOption(opt);
          setTimeOffset(0);
        }}
      />
    </Screen>
  );
}
