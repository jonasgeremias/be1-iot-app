import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDown, ArrowUp, CheckCircle2 } from '@tamagui/lucide-icons';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { MonoText, Text } from '@/shared/ui/Text';

type Props = {
  icon: ReactNode;
  iconBg: string;
  label: string;
  unit: string;
  maxRange: number;
  /** Bar/marker color when not using the thermal gradient. */
  currentColor: string;
  useGradient?: boolean;
  current: number | null | undefined;
  setpoint: number | null | undefined;
};

const TEMP_GRADIENT = ['#43A047', '#FBC02D', '#F57C00'] as const;

const clampPct = (n: number) => Math.max(0, Math.min(100, n));

/** TEMPERATURA / UMIDADE status card with setpoint marker — be1-app IotStatCard. */
export function IotStatCard({
  icon,
  iconBg,
  label,
  unit,
  maxRange,
  currentColor,
  useGradient,
  current,
  setpoint,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(0);

  const hasData = current != null && !isNaN(current);
  const hasSetpoint = setpoint != null && !isNaN(setpoint);

  const fillPct = hasData ? clampPct((current / maxRange) * 100) : 0;
  const setpointPct = hasSetpoint ? clampPct((setpoint / maxRange) * 100) : 0;
  const diff = hasData && hasSetpoint ? current - setpoint : null;

  let status: ReactNode = null;
  if (!hasData) {
    status = (
      <Text fontSize={12} color="$text3">
        Sem dados
      </Text>
    );
  } else if (diff === 0) {
    status = (
      <XStack ai="center" gap="$4">
        <CheckCircle2 size={14} color="#16A34A" />
        <Text fontSize={12} fontWeight="600" color="#16A34A">
          No setpoint
        </Text>
      </XStack>
    );
  } else if (diff != null) {
    const below = diff < 0;
    status = (
      <XStack ai="center" gap="$4">
        {below ? (
          <ArrowDown size={14} color={currentColor} />
        ) : (
          <ArrowUp size={14} color={currentColor} />
        )}
        <Text fontSize={12} fontWeight="600" color={currentColor}>
          {Math.abs(Math.round(diff))} {unit} {below ? 'abaixo' : 'acima'}
        </Text>
      </XStack>
    );
  }

  return (
    <Card br={12} elevated={false} flex={1} p="$12" gap="$8">
      <XStack ai="center" gap="$8">
        <XStack width={36} height={36} br={18} ai="center" jc="center" bg={iconBg}>
          {icon}
        </XStack>
        <Text
          fontSize={11}
          fontWeight="700"
          color="$text2"
          textTransform="uppercase"
          letterSpacing={0.4}
        >
          {label}
        </Text>
      </XStack>

      <XStack ai="flex-end" gap="$4">
        <MonoText fontSize={22} fontWeight="700" color="$text">
          {hasData ? Math.round(current) : '—'}
        </MonoText>
        <MonoText fontSize={13} color="$text2">
          / {hasSetpoint ? Math.round(setpoint) : '—'} {unit}
        </MonoText>
      </XStack>

      {/* progress + setpoint marker */}
      <View
        height={8}
        br={4}
        bg="$track"
        overflow="hidden"
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        {useGradient ? (
          <View
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            width={`${fillPct}%`}
            br={4}
            overflow="hidden"
          >
            <LinearGradient
              colors={[...TEMP_GRADIENT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: trackWidth || 200,
              }}
            />
          </View>
        ) : (
          <View
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            width={`${fillPct}%`}
            br={4}
            bg={currentColor}
          />
        )}
        {hasSetpoint ? (
          <View
            position="absolute"
            top={-1}
            bottom={-1}
            left={`${setpointPct}%`}
            width={4}
            bg="$text2"
          />
        ) : null}
      </View>

      <YStack minHeight={18} jc="center">
        {status}
      </YStack>
    </Card>
  );
}
