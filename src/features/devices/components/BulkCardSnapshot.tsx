import { Droplet, Power, Thermometer, Wind } from '@tamagui/lucide-icons';
import type { ReactNode } from 'react';
import { Spinner, View, XStack, YStack } from 'tamagui';

import { MonoText, Text } from '@/shared/ui/Text';

import type { Cb200Snapshot } from '../schemas/device.schema';

type Props = {
  snapshot: Cb200Snapshot | null;
  isLoading?: boolean;
};

function Stat({
  icon,
  current,
  setpoint,
  unit,
  valueColor = '$text',
}: {
  icon: ReactNode;
  current: string;
  setpoint?: string;
  unit?: string;
  valueColor?: string;
}) {
  return (
    <XStack ai="center" gap="$6">
      {icon}
      <XStack ai="flex-end" gap="$1">
        <MonoText fontSize={13} fontWeight="700" color={valueColor}>
          {current}
        </MonoText>
        {setpoint ? (
          <MonoText fontSize={11} color="$text3">
            /{setpoint}
          </MonoText>
        ) : null}
        {unit ? (
          <Text fontSize={11} color="$text2">
            {unit}
          </Text>
        ) : null}
      </XStack>
    </XStack>
  );
}

/** PP/BULK CB200 snapshot preview (icons + values) for the list card. */
export function BulkCardSnapshot({ snapshot, isLoading }: Props) {
  if (isLoading) {
    return (
      <View ai="center" jc="center">
        <Spinner color="$brand" />
      </View>
    );
  }

  if (!snapshot) {
    return (
      <Text fontSize={11} color="$text3" ta="center">
        Sem dados recentes
      </Text>
    );
  }

  const tempUnit = snapshot.celsius ? '°C' : '°F';
  const fmt = (n: number | null | undefined) => (n == null || isNaN(n) ? '—' : `${Math.round(n)}`);
  const blowerOn = snapshot.blower === true;

  return (
    <YStack gap="$8">
      <Stat
        icon={<Thermometer size={18} color="#D97706" />}
        current={fmt(snapshot.temperature)}
        setpoint={fmt(snapshot.stTemperature)}
        unit={tempUnit}
      />
      <Stat
        icon={<Droplet size={18} color="#1976D2" />}
        current={fmt(snapshot.humidity)}
        setpoint={fmt(snapshot.stHumidity)}
        unit="%"
      />
      <Stat
        icon={blowerOn ? <Wind size={18} color="#16A66A" /> : <Power size={18} color="#9CA3AF" />}
        current={blowerOn ? 'Ligado' : 'Desligado'}
        valueColor={blowerOn ? '#16A66A' : '#9CA3AF'}
      />
    </YStack>
  );
}
