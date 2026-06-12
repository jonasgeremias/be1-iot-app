import { useMutation } from '@tanstack/react-query';
import {
  Ban,
  ChevronLeft,
  Lock,
  RefreshCw,
  Save,
  SlidersHorizontal,
} from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Spinner, View, XStack, YStack } from 'tamagui';

import { usePermissions } from '@/hooks/usePermissions';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';

import { SettingsNode } from '../components/SettingsNode';
import { useIotDevice } from '../hooks/useIotDevice';
import { deviceService } from '../services/device.service';
import { formatMac } from '../utils/iotConstants';
import {
  countLeaves,
  deepDiff,
  setPath,
  type SettingsTree,
} from '../utils/settingsTree';

/** Device configuration · remote settings tree (admin only, SCC/PP/BULK). */
export function DeviceConfigScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const { isIotAdmin, ready } = usePermissions();
  const { device, isLoading: isLoadingDevice } = useIotDevice(deviceId);

  const [fetched, setFetched] = useState<SettingsTree | null>(null);
  const [edited, setEdited] = useState<SettingsTree>({});
  const [hash, setHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMut = useMutation({
    mutationFn: () => deviceService.getDeviceSettings(deviceId),
    onSuccess: (res) => {
      if (res.error) {
        setErrorMsg(res.message || 'Erro ao buscar configurações.');
        return;
      }
      setFetched(res.data.settings);
      setEdited(res.data.settings);
      setHash(res.data.hash);
      setErrorMsg(null);
    },
    onError: () =>
      setErrorMsg('Erro de comunicação. Verifique se o dispositivo está online.'),
  });

  const saveMut = useMutation({
    mutationFn: (diff: SettingsTree) =>
      deviceService.putDeviceSettings({ deviceId, settings: diff, hash: hash! }),
    onSuccess: (res) => {
      const apiErr = res.error || res.data.error;
      if (apiErr) {
        const m = (res.data.error ?? res.message) || '';
        setErrorMsg(
          /hash/i.test(m)
            ? 'Configurações desatualizadas (outra alteração foi aplicada). Toque em Buscar e tente novamente.'
            : m || 'Falha ao aplicar configurações.',
        );
        return;
      }
      const applied = res.data.settings;
      if (applied && Object.keys(applied).length > 0) {
        setFetched(applied);
        setEdited(applied);
      } else {
        setFetched(edited);
      }
      setHash(res.data.hash);
      setErrorMsg(null);
    },
    onError: () => setErrorMsg('Erro de comunicação ao salvar.'),
  });

  const changedDiff = fetched ? deepDiff(fetched, edited) : {};
  const changedCount = countLeaves(changedDiff);

  const onChange = (path: string[], value: unknown) =>
    setEdited((prev) => setPath(prev, path, value));

  const handleFetch = () => {
    if (changedCount > 0) {
      Alert.alert(
        'Descartar alterações?',
        `Você tem ${changedCount} campo(s) alterado(s).`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descartar e buscar',
            style: 'destructive',
            onPress: () => fetchMut.mutate(),
          },
        ],
      );
    } else {
      fetchMut.mutate();
    }
  };

  const handleSave = () => {
    if (!hash || changedCount === 0) return;
    saveMut.mutate(changedDiff);
  };

  const supported =
    device?.deviceType === 'SCC' ||
    device?.deviceType === 'PP' ||
    device?.deviceType === 'BULK';

  const header = (
    <XStack px="$16" pt="$4" pb="$8" ai="center" gap="$12">
      <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
        <ChevronLeft size={19} color="$text" />
      </IconButton>
      <YStack flex={1} minWidth={0}>
        <Text fontSize="$19" fontWeight="800" color="$text" letterSpacing={-0.3}>
          Configuração
        </Text>
        {device ? (
          <Text fontSize="$11" color="$text3" numberOfLines={1}>
            {device.nickname || formatMac(device.macAddress)}
          </Text>
        ) : null}
      </YStack>
    </XStack>
  );

  // ── gates ────────────────────────────────────────────────────────────────
  if (!ready || (isLoadingDevice && !device)) {
    return (
      <Screen tabBarSpacing>
        {header}
        <LoadingState />
      </Screen>
    );
  }

  if (!isIotAdmin) {
    return (
      <Screen tabBarSpacing>
        {header}
        <YStack ai="center" jc="center" p="$32" gap="$12">
          <Lock size={44} color="$text3" />
          <Text fontSize={16} fontWeight="700" color="$text" ta="center">
            Acesso restrito
          </Text>
          <Text fontSize={13} color="$text2" ta="center">
            Apenas administradores podem configurar o dispositivo.
          </Text>
        </YStack>
      </Screen>
    );
  }

  if (device && !supported) {
    return (
      <Screen tabBarSpacing>
        {header}
        <YStack ai="center" jc="center" p="$32" gap="$12">
          <Ban size={44} color="$text3" />
          <Text fontSize={15} ta="center" color="$text2">
            Configuração não disponível para este tipo de dispositivo.
          </Text>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarSpacing>
      {header}

      {errorMsg ? (
        <YStack px="$16" pb="$8">
          <View bg="$redSoft" br={10} p="$10">
            <Text fontSize={12} color="$red">
              {errorMsg}
            </Text>
          </View>
        </YStack>
      ) : null}

      {!fetched ? (
        <YStack px="$16" pt="$12" gap="$12">
          <Card radius={16} elevated p="$16" ai="center" gap="$12">
            <View width={56} height={56} br={28} bg="$brandSoft" ai="center" jc="center">
              <SlidersHorizontal size={26} color="$brand" />
            </View>
            <Text fontSize={14} color="$text2" ta="center">
              As configurações são lidas do dispositivo via MQTT. Toque em
              Buscar para carregar.
            </Text>
            <Button
              onPress={() => fetchMut.mutate()}
              disabled={fetchMut.isPending}
              opacity={fetchMut.isPending ? 0.7 : 1}
              icon={
                fetchMut.isPending ? (
                  <Spinner color="$white" />
                ) : (
                  <RefreshCw size={17} color="$white" />
                )
              }
            >
              {fetchMut.isPending ? 'Carregando…' : 'Buscar configurações'}
            </Button>
          </Card>
        </YStack>
      ) : (
        <YStack px="$16" pt="$4" gap="$12">
          {/* action bar */}
          <YStack gap="$8">
            <Text fontSize={12} fontWeight="700" color={changedCount ? '$brand' : '$text3'}>
              {changedCount} campo(s) alterado(s)
            </Text>
            <XStack gap="$10">
              <Button
                variant="outline"
                flex={1}
                onPress={handleFetch}
                disabled={fetchMut.isPending}
                icon={<RefreshCw size={16} color="$text" />}
              >
                {fetchMut.isPending ? 'Buscando…' : 'Buscar'}
              </Button>
              <Button
                flex={1}
                onPress={handleSave}
                disabled={changedCount === 0 || saveMut.isPending}
                opacity={changedCount === 0 || saveMut.isPending ? 0.6 : 1}
                icon={
                  saveMut.isPending ? (
                    <Spinner color="$white" />
                  ) : (
                    <Save size={16} color="$white" />
                  )
                }
              >
                {saveMut.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </XStack>
          </YStack>

          {/* settings sections */}
          {Object.keys(edited).map((sectionKey) => (
            <Card key={sectionKey} radius={16} elevated p="$12">
              <SettingsNode
                keyName={sectionKey}
                value={edited[sectionKey]}
                original={fetched?.[sectionKey]}
                path={[sectionKey]}
                onChange={onChange}
                depth={0}
              />
            </Card>
          ))}
        </YStack>
      )}
    </Screen>
  );
}
