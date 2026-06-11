import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Droplets, Play, Sun } from '@tamagui/lucide-icons';
import type { ReactNode } from 'react';
import { View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

type Props = {
  phase: number | null | undefined;
  climate: number | null | undefined;
};

const THEME_BLUE = '#1976D2';

const PHASES = [
  { value: 0x40, label: 'Secagem do Talo' },
  { value: 0x20, label: 'Secagem da Lâmina' },
  { value: 0x10, label: 'Murchamento' },
  { value: 0x08, label: 'Amarelação' },
];

const CLIMATES: { value: number; label: string; icon: ReactNode }[] = [
  { value: 0x04, label: 'Úmido', icon: <Droplets size={16} color={THEME_BLUE} /> },
  { value: 0x02, label: 'Seco', icon: <Sun size={16} color={THEME_BLUE} /> },
  { value: 0x01, label: 'Normal', icon: <Cloud size={16} color={THEME_BLUE} /> },
];

/** Fase e Clima card — be1-app IotFaseClimaCard. */
export function IotFaseClimaCard({ phase, climate }: Props) {
  return (
    <Card br={12} elevated={false} p="$12" gap="$10">
      <Text
        fontSize={11}
        fontWeight="700"
        color="$text2"
        textTransform="uppercase"
        letterSpacing={0.4}
      >
        Fase e Clima
      </Text>

      <XStack gap="$12">
        {/* FASE column */}
        <XStack flex={1} gap="$6" minHeight={132}>
          <LinearGradient
            colors={['#F57C00', '#FBC02D', '#43A047']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ width: 8, borderRadius: 4 }}
          />
          <YStack flex={1} jc="space-between">
            {PHASES.map((p) => {
              const active = p.value === phase;
              return (
                <XStack key={p.value} ai="center" gap="$4" flex={1}>
                  {active ? (
                    <Play size={14} color="$text" />
                  ) : (
                    <View width={14} />
                  )}
                  <Text
                    fontSize={11}
                    color={active ? '$text' : '$text3'}
                    fontWeight={active ? '700' : '400'}
                  >
                    {p.label}
                  </Text>
                </XStack>
              );
            })}
          </YStack>
        </XStack>

        {/* CLIMA column */}
        <YStack flex={1} jc="space-between" gap="$6">
          {CLIMATES.map((c) => {
            const active = c.value === climate;
            return (
              <XStack
                key={c.value}
                ai="center"
                gap="$6"
                borderWidth={1}
                borderColor={active ? THEME_BLUE : '#BBDEFB'}
                bg={active ? '#E3F2FD' : 'transparent'}
                br={8}
                px="$10"
                py="$8"
              >
                {c.icon}
                <Text
                  fontSize={12}
                  color={THEME_BLUE}
                  fontWeight={active ? '600' : '400'}
                >
                  {c.label}
                </Text>
              </XStack>
            );
          })}
        </YStack>
      </XStack>
    </Card>
  );
}
