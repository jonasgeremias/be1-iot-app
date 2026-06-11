import { Check, ChevronRight, Wifi } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { AppHeader } from '@/shared/components/AppHeader';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Separator } from '@/shared/ui/Separator';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Stepper } from '@/shared/ui/Stepper';
import { Switch } from '@/shared/ui/Switch';
import { MonoText, Text } from '@/shared/ui/Text';

import { SettingRow } from '../components/SettingRow';
import { useDeviceConfig } from '../hooks/useDeviceConfig';

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function CardLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize="$10.5"
      fontWeight="800"
      color="$text3"
      letterSpacing={0.6}
      px="$15"
      pt="$13"
      pb="$5"
    >
      {children}
    </Text>
  );
}

/** Device detail · configuração (screen 09). */
export function DeviceConfigScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useDeviceConfig(id ?? '');

  const [temp, setTemp] = useState(80);
  const [humidity, setHumidity] = useState(70);
  const [blowerAuto, setBlowerAuto] = useState(true);

  useEffect(() => {
    if (data) {
      setTemp(data.tempTarget);
      setHumidity(data.humidityTarget);
      setBlowerAuto(data.blowerAuto);
    }
  }, [data]);

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
      <AppHeader
        title={data.name}
        titleSize="$18"
        subtitle={`${data.model} · ${data.mac}`}
        subtitleMono
        onBack={() => router.back()}
        right={<StatusBadge status={data.status} />}
      />

      <YStack px="$16" gap="$12" pt="$2">
        {/* Setpoints */}
        <Card radius={18} elevated>
          <CardLabel>SETPOINTS</CardLabel>
          <SettingRow
            title="Temperatura alvo"
            subtitle={`Faixa ${data.tempMin} – ${data.tempMax} °C`}
            right={
              <Stepper
                accessibilityLabel="Temperatura alvo"
                displayValue={`${temp}°C`}
                onDecrement={() => setTemp((v) => clamp(v - 1, data.tempMin, data.tempMax))}
                onIncrement={() => setTemp((v) => clamp(v + 1, data.tempMin, data.tempMax))}
              />
            }
          />
          <Separator mx="$15" />
          <SettingRow
            title="Umidade alvo"
            subtitle={`Faixa ${data.humidityMin} – ${data.humidityMax} %`}
            right={
              <Stepper
                accessibilityLabel="Umidade alvo"
                displayValue={`${humidity}%`}
                onDecrement={() =>
                  setHumidity((v) => clamp(v - 1, data.humidityMin, data.humidityMax))
                }
                onIncrement={() =>
                  setHumidity((v) => clamp(v + 1, data.humidityMin, data.humidityMax))
                }
              />
            }
          />
        </Card>

        {/* Operational */}
        <Card radius={18} elevated>
          <CardLabel>OPERACIONAL</CardLabel>
          <SettingRow
            title="Soprador automático"
            subtitle={blowerAuto ? 'Ativado' : 'Desativado'}
            subtitleColor="$online"
            right={
              <Switch
                value={blowerAuto}
                onValueChange={setBlowerAuto}
                accessibilityLabel="Soprador automático"
              />
            }
          />
          <Separator mx="$15" />
          <SettingRow
            title="Intervalo de leitura"
            onPress={() => {}}
            right={
              <XStack ai="center" gap="$8">
                <MonoText fontSize="$13" fontWeight="700" color="$text2">
                  {data.readingInterval}
                </MonoText>
                <ChevronRight size={16} color="$text3" />
              </XStack>
            }
          />
          <Separator mx="$15" />
          <SettingRow
            title="Fase de secagem"
            onPress={() => {}}
            right={
              <XStack ai="center" gap="$8">
                <Text fontSize="$13" fontWeight="700" color="$text2">
                  {data.dryingPhase}
                </Text>
                <ChevronRight size={16} color="$text3" />
              </XStack>
            }
          />
        </Card>

        {/* Network */}
        <Card radius={18} elevated>
          <CardLabel>REDE</CardLabel>
          <SettingRow
            title="Wi‑Fi"
            leadingIcon={<Wifi size={17} color="$online" />}
            right={
              <Text fontSize="$13" fontWeight="700" color="$text2">
                {data.wifi}
              </Text>
            }
          />
          <Separator mx="$15" />
          <SettingRow
            title="Endereço IP"
            right={
              <MonoText fontSize="$13" fontWeight="700" color="$text2">
                {data.ip}
              </MonoText>
            }
          />
        </Card>

        <Button
          height={50}
          icon={<Check size={17} color="$white" />}
          accessibilityLabel="Aplicar alterações"
        >
          Aplicar alterações
        </Button>
      </YStack>
    </Screen>
  );
}
