import { Ban, ChevronLeft, Lock, RefreshCw, Save, SlidersHorizontal } from '@tamagui/lucide-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { Spinner, View, XStack, YStack } from 'tamagui';

import { usePermissions } from '@/hooks/usePermissions';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';

import { SettingsNode } from '../components/SettingsNode';
import { useDeviceSettings } from '../hooks/useDeviceSettings';
import { useIotDevice } from '../hooks/useIotDevice';
import { formatMac } from '../utils/iotConstants';

/** Device configuration: remote settings tree (admin only, SCC/PP/BULK). */
export function DeviceConfigScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const { isIotAdmin, ready } = usePermissions();
  const { device, isLoading: isLoadingDevice } = useIotDevice(deviceId);
  const settings = useDeviceSettings(deviceId);

  const supported =
    device?.deviceType === 'SCC' || device?.deviceType === 'PP' || device?.deviceType === 'BULK';

  const header = (
    <XStack px="$16" pt="$4" pb="$8" ai="center" gap="$12">
      <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
        <ChevronLeft size={19} color="$text" />
      </IconButton>
      <YStack flex={1} minWidth={0}>
        <Text fontSize="$19" fontWeight="800" color="$text" letterSpacing={-0.3}>
          Configuracao
        </Text>
        {device ? (
          <Text fontSize="$11" color="$text3" numberOfLines={1}>
            {device.nickname || formatMac(device.macAddress)}
          </Text>
        ) : null}
      </YStack>
    </XStack>
  );

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
            Configuracao nao disponivel para este tipo de dispositivo.
          </Text>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarSpacing>
      {header}

      {settings.errorMsg ? (
        <YStack px="$16" pb="$8">
          <View bg="$redSoft" br={10} p="$10">
            <Text fontSize={12} color="$red">
              {settings.errorMsg}
            </Text>
          </View>
        </YStack>
      ) : null}

      {!settings.fetched ? (
        <YStack px="$16" pt="$12" gap="$12">
          <Card radius={16} elevated p="$16" ai="center" gap="$12">
            <View width={56} height={56} br={28} bg="$brandSoft" ai="center" jc="center">
              <SlidersHorizontal size={26} color="$brand" />
            </View>
            <Text fontSize={14} color="$text2" ta="center">
              As configuracoes sao lidas do dispositivo via MQTT. Toque em Buscar para carregar.
            </Text>
            <Button
              onPress={settings.fetchNow}
              disabled={settings.isFetching}
              opacity={settings.isFetching ? 0.7 : 1}
              icon={
                settings.isFetching ? (
                  <Spinner color="$white" />
                ) : (
                  <RefreshCw size={17} color="$white" />
                )
              }
            >
              {settings.isFetching ? 'Carregando...' : 'Buscar configuracoes'}
            </Button>
          </Card>
        </YStack>
      ) : (
        <YStack px="$16" pt="$4" gap="$12">
          <YStack gap="$8">
            <Text
              fontSize={12}
              fontWeight="700"
              color={settings.changedCount ? '$brand' : '$text3'}
            >
              {settings.changedCount} campo(s) alterado(s)
            </Text>
            <XStack gap="$10">
              <Button
                variant="outline"
                flex={1}
                onPress={settings.fetch}
                disabled={settings.isFetching}
                icon={<RefreshCw size={16} color="$text" />}
              >
                {settings.isFetching ? 'Buscando...' : 'Buscar'}
              </Button>
              <Button
                flex={1}
                onPress={settings.save}
                disabled={settings.changedCount === 0 || settings.isSaving}
                opacity={settings.changedCount === 0 || settings.isSaving ? 0.6 : 1}
                icon={
                  settings.isSaving ? <Spinner color="$white" /> : <Save size={16} color="$white" />
                }
              >
                {settings.isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </XStack>
          </YStack>

          {Object.keys(settings.edited).map((sectionKey) => (
            <Card key={sectionKey} radius={16} elevated p="$12">
              <SettingsNode
                keyName={sectionKey}
                value={settings.edited[sectionKey]}
                original={settings.fetched?.[sectionKey]}
                path={[sectionKey]}
                onChange={settings.onChange}
                depth={0}
              />
            </Card>
          ))}
        </YStack>
      )}
    </Screen>
  );
}
