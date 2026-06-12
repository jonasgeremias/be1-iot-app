import { Cloud, Droplets, Play, Sun } from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NamedExoticComponent } from 'react';
import { View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

type Props = {
  phase: number | null | undefined;
  climate: number | null | undefined;
};

type LucideIcon = NamedExoticComponent<{ size?: number; color?: string }>;

const PHASES = [
  { value: 0x40, label: 'Secagem do Talo' },
  { value: 0x20, label: 'Secagem da Lamina' },
  { value: 0x10, label: 'Murchamento' },
  { value: 0x08, label: 'Amarelacao' },
];

const CLIMATES: { value: number; label: string; Icon: LucideIcon }[] = [
  { value: 0x04, label: 'Umido', Icon: Droplets as LucideIcon },
  { value: 0x02, label: 'Seco', Icon: Sun as LucideIcon },
  { value: 0x01, label: 'Normal', Icon: Cloud as LucideIcon },
];

/** Fase e Clima card: be1-app IotFaseClimaCard. */
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
                  {active ? <Play size={14} color="$text" /> : <View width={14} />}
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

        <YStack flex={1} jc="space-between" gap="$6">
          {CLIMATES.map((c) => {
            const active = c.value === climate;
            const Icon = c.Icon;
            return (
              <XStack
                key={c.value}
                ai="center"
                gap="$6"
                borderWidth={1}
                borderColor={active ? '$brand' : '$border'}
                bg={active ? '$brandSoft' : '$surface2'}
                br={8}
                px="$10"
                py="$8"
              >
                <Icon size={16} color={active ? '$brand' : '$text3'} />
                <Text
                  fontSize={12}
                  color={active ? '$brand' : '$text2'}
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
