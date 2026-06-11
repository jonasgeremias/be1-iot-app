import { Droplet, Thermometer } from '@tamagui/lucide-icons';
import { XStack, YStack } from 'tamagui';

import type { Cb200Snapshot } from '../schemas/device.schema';
import { IotFaseClimaCard } from './IotFaseClimaCard';
import { IotSopradorCard } from './IotSopradorCard';
import { IotStatCard } from './IotStatCard';

type Props = {
  snapshot: Cb200Snapshot | null;
};

/** Temp + Umidade + Soprador + Fase/Clima cluster — be1-app Cb200StatCards. */
export function Cb200StatCards({ snapshot }: Props) {
  const tempUnit = snapshot?.celsius ? '°C' : '°F';

  return (
    <YStack gap="$10">
      <XStack gap="$10">
        <IotStatCard
          icon={<Thermometer size={22} color="#D97706" />}
          iconBg="$amberSoft"
          label="Temperatura"
          unit={tempUnit}
          maxRange={200}
          currentColor="#D97706"
          useGradient
          current={snapshot?.temperature}
          setpoint={snapshot?.stTemperature}
        />
        <IotStatCard
          icon={<Droplet size={22} color="#1976D2" />}
          iconBg="$brandSoft"
          label="Umidade"
          unit="%"
          maxRange={100}
          currentColor="#1976D2"
          current={snapshot?.humidity}
          setpoint={snapshot?.stHumidity}
        />
      </XStack>

      <IotSopradorCard on={snapshot ? snapshot.blower : null} />
      <IotFaseClimaCard phase={snapshot?.phase} climate={snapshot?.climate} />
    </YStack>
  );
}
