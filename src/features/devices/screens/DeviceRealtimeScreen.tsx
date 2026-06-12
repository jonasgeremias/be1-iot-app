import { Ban, CloudOff, Pencil } from '@tamagui/lucide-icons';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { YStack, XStack } from 'tamagui';

import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Chip } from '@/shared/ui/Chip';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';

import { BulkLastReadingBar } from '../components/BulkLastReadingBar';
import { Cb200StatCards } from '../components/Cb200StatCards';
import { ChamberGrid } from '../components/ChamberGrid';
import { EditNameModal } from '../components/EditNameModal';
import { IotAlarmCard } from '../components/IotAlarmCard';
import { SccCb200Card } from '../components/SccCb200Card';
import { SccTempVariationChart } from '../components/SccTempVariationChart';
import { useIotDevice } from '../hooks/useIotDevice';
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
import { formatMac, STATUS_LABELS } from '../utils/iotConstants';

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

/** Device detail · live state (be1-app MonitoringView). History lives in the Histórico tab. */
export function DeviceRealtimeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const { device, isLoading: isLoadingDevice, isError: deviceError, refetch: refetchDevice } =
    useIotDevice(deviceId);

  const isScc = device?.deviceType === 'SCC';
  const isBulkLike = device?.deviceType === 'PP' || device?.deviceType === 'BULK';

  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);

  // ── nickname editing ───────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const { updateDeviceName } = useIotDevices();
  const fallbackName = device
    ? device.nickname || formatMac(device.macAddress)
    : '';
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
  } = useIotLatestData(
    deviceId,
    isScc || isBulkLike ? LATEST_CARD_POLL_MS : undefined,
  );

  const sccChambers = getSccChambers(latestData);
  const cb200Snapshot = getCb200Snapshot(latestData);
  const sccCb200Data = getSccCb200Data(latestData);
  const sccDeviceSnapshot = getSccDeviceSnapshot(latestData);

  // auto-select first chamber (grid highlight)
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

  const status = STATUS_LABELS[device.status];
  const hasChamberData = sccChambers
    ? Object.keys(sccChambers).some((k) => k !== '9')
    : false;

  return (
    <Screen scroll tabBarSpacing>
      {/* header */}
      <XStack px="$16" pt="$4" pb="$8" ai="center" gap="$12">
        <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={19} color="$text" />
        </IconButton>
        <YStack flex={1} minWidth={0}>
          <Text fontSize="$19" fontWeight="800" color="$text" numberOfLines={1} letterSpacing={-0.3}>
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
              <ChamberGrid
                latestData={sccChambers}
                isLoading={isLoadingLatest}
                selectedChamber={selectedChamber}
                onSelectChamber={setSelectedChamber}
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
