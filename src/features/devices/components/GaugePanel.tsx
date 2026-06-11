import { Droplet, Thermometer } from '@tamagui/lucide-icons';
import type { ReactNode } from 'react';
import { View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { MonoText, Text } from '@/shared/ui/Text';

import type { Gauge } from '../schemas/device.schema';

function GaugeColumn({
  icon,
  iconBg,
  label,
  gauge,
}: {
  icon: ReactNode;
  iconBg: '$amberSoft' | '$brandSoft';
  label: string;
  gauge: Gauge;
}) {
  const accent = gauge.accent === 'amber' ? '$amber' : '$brand';
  return (
    <YStack flex={1}>
      <XStack ai="center" gap="$8" mb="$7">
        <View width={24} height={24} br={8} ai="center" jc="center" bg={iconBg}>
          {icon}
        </View>
        <Text fontSize="$9.5" fontWeight="800" color="$text2" letterSpacing={0.5}>
          {label}
        </Text>
      </XStack>
      <XStack ai="flex-end">
        <MonoText fontSize="$25" fontWeight="800" color="$text" lineHeight={25}>
          {gauge.value}
        </MonoText>
        <MonoText fontSize="$11" color="$text3">
          {' '}
          / {gauge.target} {gauge.unit}
        </MonoText>
      </XStack>
      <View my="$10" mb="$7">
        <ProgressBar
          value={gauge.pct}
          gradient={gauge.accent === 'amber'}
          fill="$brand"
          showMarker
        />
      </View>
      <Text fontSize="$11" fontWeight="700" color={accent}>
        {gauge.deltaLabel}
      </Text>
    </YStack>
  );
}

/** CB200 temperature + humidity gauge panel. */
export function GaugePanel({
  model,
  temp,
  humidity,
}: {
  model: string;
  temp: Gauge;
  humidity: Gauge;
}) {
  return (
    <Card radius={18} elevated p="$15">
      <Text
        fontSize="$11"
        fontWeight="800"
        color="$text2"
        letterSpacing={1.5}
        mb="$13"
      >
        {model}
      </Text>
      <XStack gap="$14">
        <GaugeColumn
          icon={<Thermometer size={14} color="$amber" />}
          iconBg="$amberSoft"
          label="TEMPERATURA"
          gauge={temp}
        />
        <View width={1} bg="$border" />
        <GaugeColumn
          icon={<Droplet size={14} color="$brand" />}
          iconBg="$brandSoft"
          label="UMIDADE"
          gauge={humidity}
        />
      </XStack>
    </Card>
  );
}
