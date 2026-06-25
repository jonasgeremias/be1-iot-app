import { Ban, CloudOff, Pencil, ChevronLeft, ToggleRight } from '@tamagui/lucide-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { YStack, XStack } from 'tamagui';

import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { ProfileButton } from '@/shared/components/ProfileButton';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';

import { BulkDeviceHistory } from '../components/BulkDeviceHistory';
import { BulkLastReadingBar } from '../components/BulkLastReadingBar';
import { Cb200StatCards } from '../components/Cb200StatCards';
import { ChamberGrid } from '../components/ChamberGrid';
import { ChamberHistoryChart } from '../components/ChamberHistoryChart';
import { EditNameModal } from '../components/EditNameModal';
import { IotAlarmCard } from '../components/IotAlarmCard';
import { SccBlueprintCard } from '../components/SccBlueprintCard';
import { SccCb200Card } from '../components/SccCb200Card';
import { SccTempVariationChart } from '../components/SccTempVariationChart';
import { TimeRangePicker } from '../components/TimeRangePicker';
import { useIotDevice } from '../hooks/useIotDevice';
import { useIotDeviceHistory } from '../hooks/useIotDeviceHistory';
import { useIotDevices } from '../hooks/useIotDevices';
import { LATEST_CARD_POLL_MS, useIotLatestData } from '../hooks/useIotLatestData';
import { useRefetchCountdown } from '../hooks/useRefetchCountdown';
import {
  getCb200Snapshot,
  getDeviceSnapshot,
  getSccCb200Data,
  getSccChambers,
  getSccDeviceSnapshot,
} from '../utils/latestData';
import { formatMac, getStatusLabel } from '../utils/iotConstants';
import { timeRangePresets, type TimeRangePresetOptions } from '../utils/timeRangePresets';

function NoDeviceData() {
  return (
    <YStack flex={1} ai="center" jc="center" p="$32" gap="$12">
      <CloudOff size={48} color="$text3" />
      <Text fontSize={16} ta="center" color="$text2">
        Nenhum dado encontrado para este dispositivo.
      </Text>
    </YStack>
  );
}

/** Device detail · live state + live chart (be1-app MonitoringView). */
export function DeviceRealtimeScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const {
    device,
    isLoading: isLoadingDevice,
    isError: deviceError,
    refetch: refetchDevice,
  } = useIotDevice(deviceId);

  const isScc = device?.deviceType === 'SCC';
  const isBulkLike = device?.deviceType === 'PP' || device?.deviceType === 'BULK';

  // ── live history (recent period, auto-refreshing) ──────────────────────────
  const [timeRangeOption, setTimeRangeOption] = useState<TimeRangePresetOptions>('1day');
  const [timeOffset, setTimeOffset] = useState(0);
  const timeRange = timeRangePresets[timeRangeOption];
  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // ── nickname editing ───────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const { updateDeviceName } = useIotDevices();
  const fallbackName = device ? device.nickname || formatMac(device.macAddress) : '';
  useEffect(() => {
    if (device) setNewNickname(device.nickname || formatMac(device.macAddress));
  }, [device]);

  // ── live data ──────────────────────────────────────────────────────────────
  const {
    latestData,
    lastFetch,
    refetch: refetchLatest,
    isLoading: isLoadingLatest,
    dataUpdatedAt,
  } = useIotLatestData(deviceId, isScc || isBulkLike ? LATEST_CARD_POLL_MS : undefined);

  const sccChambers = getSccChambers(latestData);
  const cb200Snapshot = getCb200Snapshot(latestData);
  const sccCb200Data = getSccCb200Data(latestData);
  const sccDeviceSnapshot = getSccDeviceSnapshot(latestData);

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

  const { secondsLeft, totalSeconds, progress } = useRefetchCountdown(
    LATEST_CARD_POLL_MS,
    dataUpdatedAt,
  );

  const chamberHistory = selectedChamber ? (deviceHistory?.[selectedChamber] ?? []) : [];

  // auto-refresh latest + history every 40s on the current period
  const refetchLatestRef = useRef(refetchLatest);
  const refetchHistoryRef = useRef(refetchHistory);
  useEffect(() => {
    refetchLatestRef.current = refetchLatest;
  }, [refetchLatest]);
  useEffect(() => {
    refetchHistoryRef.current = refetchHistory;
  }, [refetchHistory]);
  useEffect(() => {
    if (timeOffset !== 0) return;
    const t = setInterval(() => {
      void refetchLatestRef.current();
      void refetchHistoryRef.current();
    }, 40_000);
    return () => clearInterval(t);
  }, [timeOffset]);

  const moveTimeOffset = (move: 1 | -1) => setTimeOffset((prev) => Math.max(0, prev + move));

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

  const handleEditName = async () => {
    if (!device) return;
    try {
      setSavingName(true);
      await updateDeviceName({
        id: device.id,
        nickname: newNickname || fallbackName,
      });
      setIsEditing(false);
    } finally {
      setSavingName(false);
    }
  };

  // ── render gates ───────────────────────────────────────────────────────────
  if (deviceError) {
    return (
      <Screen tabBarSpacing>
        <ErrorState onRetry={() => void refetchDevice()} />
      </Screen>
    );
  }
  if (isLoadingDevice && !device) {
    return (
      <Screen tabBarSpacing>
        <LoadingState />
      </Screen>
    );
  }
  if (!device) {
    return (
      <Screen tabBarSpacing>
        <NoDeviceData />
      </Screen>
    );
  }

  const status = getStatusLabel(device.status);
  const hasChamberData = sccChambers ? Object.keys(sccChambers).some((k) => k !== '9') : false;

  return (
    <Screen scroll tabBarSpacing>
      {/* header */}
      <XStack px="$16" pt="$4" pb="$8" ai="center" gap="$12">
        <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={19} color="$text" />
        </IconButton>
        <YStack flex={1} minWidth={0}>
          <Text
            fontSize="$19"
            fontWeight="800"
            color="$text"
            numberOfLines={1}
            letterSpacing={-0.3}
          >
            {device.nickname || fallbackName}
          </Text>
        </YStack>
        <IconButton
          accessibilityLabel="Editar dispositivo"
          tone="brandSoft"
          onPress={() => setIsEditing(true)}
        >
          <Pencil size={17} color="$brand" />
        </IconButton>
        <ProfileButton />
      </XStack>

      {/* meta chips */}
      <XStack px="$16" pb="$12" gap="$6" flexWrap="wrap">
        <Chip tone="brand" label={`MODELO · ${device.deviceType}`} fontWeight="800" />
        <Chip tone={status.tone} label={status.label} fontWeight="800" />
        <Chip tone="neutral" label={formatMac(device.macAddress)} mono fontWeight="600" />
      </XStack>

      <YStack px="$16" gap="$11">
        {isScc || isBulkLike ? (
          <BulkLastReadingBar
            lastReading={lastFetch}
            deviceStatus={device.status}
            secondsLeft={secondsLeft}
            totalSeconds={totalSeconds}
            progress={progress}
            onRefetch={() => void refetchLatest()}
          />
        ) : null}

        {isScc ? (
          isLoadingLatest || hasChamberData ? (
            <>
              <Button
                variant="outline"
                icon={<ToggleRight size={18} color="$brand" />}
                onPress={() => router.push(`/device/command/${deviceId}`)}
                accessibilityLabel="Abrir caixa de comando"
              >
                Caixa de Comando
              </Button>
              <ChamberGrid
                latestData={sccChambers}
                isLoading={isLoadingLatest}
                selectedChamber={selectedChamber}
                onSelectChamber={setSelectedChamber}
              />
              <SccBlueprintCard
                chambers={sccChambers}
                scale={sccCb200Data?.celsius ? 'celsius' : 'fahrenheit'}
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
              <SccTempVariationChart
                chambers={sccChambers}
                scale={sccCb200Data?.celsius ? 'celsius' : 'fahrenheit'}
                highVariationThresholdF={15}
              />
              {sccCb200Data ? <SccCb200Card cb200Data={sccCb200Data} /> : null}
              {sccDeviceSnapshot ? (
                <IotAlarmCard alarmsFlags={sccDeviceSnapshot.alarmsFlags} />
              ) : null}
            </>
          ) : (
            <NoDeviceData />
          )
        ) : isBulkLike ? (
          <>
            <Cb200StatCards snapshot={cb200Snapshot} />
            {getDeviceSnapshot(latestData) ? (
              <IotAlarmCard alarmsFlags={getDeviceSnapshot(latestData)!.alarmsFlags} />
            ) : null}
            <BulkDeviceHistory deviceId={deviceId} referenceDate={lastFetch} />
          </>
        ) : (
          <YStack ai="center" jc="center" p="$32" gap="$12">
            <Ban size={48} color="$text3" />
            <Text fontSize={16} ta="center" color="$text2">
              Tipo de dispositivo não suportado nesta versão.
            </Text>
          </YStack>
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

      <EditNameModal
        visible={isEditing}
        value={newNickname}
        isLoading={savingName}
        onChange={setNewNickname}
        onCancel={() => {
          setIsEditing(false);
          setNewNickname(device.nickname || fallbackName);
        }}
        onSave={() => void handleEditName()}
      />
    </Screen>
  );
}
