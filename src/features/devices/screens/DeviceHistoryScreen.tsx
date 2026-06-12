import { Ban, ChevronLeft, RefreshCw } from '@tamagui/lucide-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Spinner, XStack, YStack } from 'tamagui';

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
  const { id } = useGlobalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const { device, isLoading: isLoadingDevice } = useIotDevice(deviceId);

  const [timeRangeOption, setTimeRangeOption] =
    useState<TimeRangePresetOptions>('1day');
  const [timeOffset, setTimeOffset] = useState(0);
  const timeRange = timeRangePresets[timeRangeOption];
  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const {
    latestData,
    lastFetch,
    isLoading: isLoadingLatest,
    refetch: refetchLatest,
  } = useIotLatestData(deviceId, LATEST_CARD_POLL_MS);

  // Type from the live snapshot first, falling back to the grouped cache.
  const deviceType = latestData?.deviceType ?? device?.deviceType;
  const isScc = deviceType === 'SCC';
  const isBulkLike = deviceType === 'PP' || deviceType === 'BULK';

  const sccChambers = getSccChambers(latestData);

  const {
    deviceHistory,
    isFetching: isFetchingHistory,
    refetch: refetchHistory,
  } = useIotDeviceHistory(isScc ? deviceId : '', timeRangeOption, timeOffset);

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

  const refreshing = isLoadingLatest || isFetchingHistory;
  const onRefresh = () => {
    void refetchLatest();
    void refetchHistory();
  };

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
      <IconButton accessibilityLabel="Buscar" tone="brandSoft" onPress={onRefresh}>
        {refreshing ? <Spinner color="$brand" /> : <RefreshCw size={17} color="$brand" />}
      </IconButton>
    </XStack>
  );

  // Wait until we can determine the device type (from live data or cache).
  if (!deviceType && (isLoadingDevice || isLoadingLatest)) {
    return (
      <Screen tabBarSpacing>
        {header}
        <LoadingState />
      </Screen>
    );
  }

  if (deviceType && !isScc && !isBulkLike) {
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
