import { Ban, ChevronLeft } from '@tamagui/lucide-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { usePermissions } from '@/hooks/usePermissions';
import { logger } from '@/services/logger/logger';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';

import { ActuatorModeBar, type ActuatorMode } from '../components/ActuatorModeBar';
import { ActuatorSvgPanel } from '../components/ActuatorSvgPanel';
import { useActuatorCommand } from '../hooks/useActuatorCommand';
import { useDeviceActuators } from '../hooks/useDeviceActuators';
import { useIotDevice } from '../hooks/useIotDevice';
import { ACTUATOR_COLORS, actuatorLabel, type ActuatorCommand } from '../utils/actuatorState';
import { formatMac, getReadingStatus, getStatusLabel } from '../utils/iotConstants';

/** Faixa de aviso (leitura/offline/bloqueio) — texto curto em caixa tonalizada. */
function Notice({ tone, children }: { tone: 'amber' | 'red' | 'neutral'; children: string }) {
  const bg = tone === 'red' ? '$redSoft' : tone === 'amber' ? '$amberSoft' : '$surface2';
  const color = tone === 'red' ? '$red' : tone === 'amber' ? '$amber' : '$text2';
  return (
    <YStack bg={bg} br={12} px="$14" py="$10">
      <Text fontSize={13} fontWeight="600" color={color}>
        {children}
      </Text>
    </YStack>
  );
}

/**
 * Tela dedicada da Caixa de Comando (atuadores) — aberta pelo botão no detalhe do
 * SCC. Estado real ao vivo (latest data) + acionamento via API
 * (`POST /iot/device/actuators`); sem otimismo — a UI reflete o latest após o
 * comando. Gated por permissão (`iotControlActuators`) e pelas travas da §7.
 */
export function DeviceActuatorsScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const {
    device,
    isLoading: isLoadingDevice,
    isError: deviceError,
    refetch: refetchDevice,
  } = useIotDevice(deviceId);
  const { actuators, lastFetch } = useDeviceActuators(deviceId);
  const { canControlActuators } = usePermissions();
  const { sendCommand, isPending, isError } = useActuatorCommand(deviceId);

  // ── estado de UI (nunca no React Query) ─────────────────────────────────────
  const [locked, setLocked] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<ActuatorMode>('momentary');
  const [seconds, setSeconds] = useState(10);
  const [heldIndex, setHeldIndex] = useState<number | null>(null);

  // TODO(plano §14): FORCE_ONLINE é temporário — sempre trata como online para
  // facilitar o teste da UI. Remover e restaurar a proteção offline (que
  // desabilita o acionamento quando o dispositivo está offline).
  const FORCE_ONLINE = true;
  const reading = getReadingStatus(lastFetch, device?.status);
  const offline = FORCE_ONLINE ? false : reading.kind === 'offline' || !actuators.link;
  const baseEnabled = canControlActuators && !offline && !locked && !isPending;

  const isDisabled = useCallback(
    (index: number) => {
      if (!baseEnabled) return true;
      // Apenas um atuador "mantido" por vez: trava os demais enquanto há um held.
      if (heldIndex != null && heldIndex !== index) return true;
      return false;
    },
    [baseEnabled, heldIndex],
  );

  const canTrigger =
    baseEnabled && selectedIndex != null && heldIndex == null && (mode !== 'timed' || seconds >= 1);
  const canStop = heldIndex != null && canControlActuators && !offline && !isPending;

  // ── envio real (POST /iot/device/actuators → invalida o latest) ──────────────
  const runCommand = useCallback(
    async (command: ActuatorCommand, nextHeld: number | null) => {
      try {
        await sendCommand(command);
        // Hardware é fire-and-forget; `heldIndex` é só a marca local p/ o Parar.
        setHeldIndex(nextHeld);
      } catch (err) {
        logger.warn('actuators', 'falha ao enviar comando', { deviceId, err });
        // O erro vira aviso inline via `isError`; mantém o último estado conhecido.
      }
    },
    [deviceId, sendCommand],
  );

  const handleTrigger = useCallback(() => {
    if (selectedIndex == null) return;
    const key = String(selectedIndex);
    if (mode === 'momentary') {
      void runCommand({ actuatorsMap: { [key]: true } }, null);
    } else if (mode === 'timed') {
      void runCommand({ actuatorsMapLongPress: { [key]: seconds } }, null);
    } else {
      // Manter pressionado: 0 = segura até o comando de parar.
      void runCommand({ actuatorsMapLongPress: { [key]: 0 } }, selectedIndex);
    }
  }, [mode, seconds, selectedIndex, runCommand]);

  const handleStop = useCallback(() => {
    if (heldIndex == null) return;
    void runCommand({ actuatorsMap: { [String(heldIndex)]: false } }, null);
  }, [heldIndex, runCommand]);

  // ── gates de render ──────────────────────────────────────────────────────────
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

  const deviceName = device ? device.nickname || formatMac(device.macAddress) : '';
  const status = device ? getStatusLabel(device.status) : null;

  const Header = (
    <XStack px="$16" pt="$4" pb="$8" ai="center" gap="$12">
      <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
        <ChevronLeft size={19} color="$text" />
      </IconButton>
      <YStack flex={1} minWidth={0}>
        <Text fontSize={12} fontWeight="700" color="$text2">
          Caixa de Comando
        </Text>
        <Text fontSize={18} fontWeight="800" color="$text" numberOfLines={1} letterSpacing={-0.3}>
          {deviceName}
        </Text>
      </YStack>
    </XStack>
  );

  if (device && device.deviceType !== 'SCC') {
    return (
      <Screen scroll>
        {Header}
        <YStack ai="center" jc="center" p="$32" gap="$12">
          <Ban size={48} color="$text3" />
          <Text fontSize={16} ta="center" color="$text2">
            Caixa de comando disponível apenas para dispositivos SCC.
          </Text>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {Header}

      <YStack px="$16" gap="$14">
        {/* chips de meta */}
        <XStack gap="$6" flexWrap="wrap">
          {status ? <Chip tone={status.tone} label={status.label} fontWeight="800" /> : null}
          {device ? (
            <Chip tone="neutral" label={formatMac(device.macAddress)} mono fontWeight="600" />
          ) : null}
        </XStack>

        {!canControlActuators ? (
          <Notice tone="neutral">
            Somente leitura — você não tem permissão para acionar atuadores.
          </Notice>
        ) : offline ? (
          <Notice tone="red">Dispositivo offline — acionamento indisponível.</Notice>
        ) : locked ? (
          <Notice tone="amber">Painel bloqueado — desbloqueie para acionar.</Notice>
        ) : null}

        {isError ? <Notice tone="red">Falha ao enviar o comando. Tente novamente.</Notice> : null}
      </YStack>

      {/* painel COMANDO (ca.svg) em largura cheia, com LEDs ao vivo + cadeado */}
      <YStack px="$8" py="$12">
        <ActuatorSvgPanel
          cells={actuators.cells}
          locked={locked}
          selectedIndex={selectedIndex}
          isDisabled={isDisabled}
          lockDisabled={!canControlActuators || offline}
          onSelect={setSelectedIndex}
          onToggleLock={() => setLocked((prev) => !prev)}
        />
      </YStack>

      <YStack px="$16" gap="$14">
        {/* seleção / modo / acionar */}
        <Text fontSize={13} fontWeight="600" color="$text2">
          {selectedIndex != null
            ? `Atuador ${actuatorLabel(selectedIndex)} selecionado · escolha o modo e toque em Acionar.`
            : 'Toque em um atuador no painel para selecioná-lo; depois escolha o modo e toque em Acionar.'}
        </Text>

        <ActuatorModeBar
          mode={mode}
          onModeChange={setMode}
          seconds={seconds}
          onSecondsChange={setSeconds}
          canTrigger={canTrigger}
          pending={isPending}
          onTrigger={handleTrigger}
        />

        {/* parar — só quando há um atuador mantido */}
        {heldIndex != null ? (
          <Button
            variant="primary"
            bg={ACTUATOR_COLORS.red}
            shadowColor={ACTUATOR_COLORS.red}
            opacity={canStop ? 1 : 0.5}
            onPress={canStop ? handleStop : undefined}
            accessibilityLabel="Parar atuador"
          >
            {`Parar (atuador ${actuatorLabel(heldIndex)})`}
          </Button>
        ) : null}
      </YStack>
    </Screen>
  );
}
