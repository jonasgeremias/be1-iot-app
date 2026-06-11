import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Play, Sun, Wind } from '@tamagui/lucide-icons';
import { useTheme, View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import type { DeviceDetail } from '../schemas/device.schema';

const CLIMATE_ICON: Record<string, typeof Sun> = {
  Úmido: Wind,
  Seco: Sun,
  Normal: Cloud,
};

/** "FASE E CLIMA" — drying-phase progression + current climate selection. */
export function PhaseClimateCard({
  phase,
  climate,
}: {
  phase: DeviceDetail['phase'];
  climate: DeviceDetail['climate'];
}) {
  const theme = useTheme();
  return (
    <Card radius={18} elevated p="$15">
      <Text
        fontSize="$11"
        fontWeight="800"
        color="$text2"
        letterSpacing={1}
        mb="$13"
      >
        FASE E CLIMA
      </Text>
      <XStack gap="$14">
        {/* Phase progression */}
        <XStack flex={1} gap="$10">
          <LinearGradient
            colors={[theme.amber.get(), theme.online.get()]}
            start={[0.5, 0]}
            end={[0.5, 1]}
            style={{ width: 6, borderRadius: 4 }}
          />
          <YStack gap="$10" jc="center">
            {phase.steps.map((step) => {
              const active = step === phase.current;
              return (
                <XStack key={step} ai="center" gap="$6">
                  {active ? <Play size={9} color="$online" fill="$online" /> : null}
                  <Text
                    fontSize={active ? '$12' : '$11.5'}
                    fontWeight={active ? '800' : '400'}
                    color={active ? '$text' : '$text3'}
                  >
                    {step}
                  </Text>
                </XStack>
              );
            })}
          </YStack>
        </XStack>

        {/* Climate options */}
        <YStack gap="$8" width={118} jc="center">
          {climate.options.map((option) => {
            const active = option === climate.current;
            const Icon = CLIMATE_ICON[option] ?? Cloud;
            return (
              <XStack
                key={option}
                ai="center"
                gap="$8"
                px="$11"
                py="$8"
                br={11}
                borderWidth={1.5}
                borderColor={active ? '$brand' : '$border'}
                bg={active ? '$brandSoft' : 'transparent'}
              >
                <Icon size={15} color={active ? '$brand' : '$text2'} />
                <Text
                  fontSize="$12"
                  fontWeight={active ? '800' : '700'}
                  color={active ? '$brand' : '$text2'}
                >
                  {option}
                </Text>
              </XStack>
            );
          })}
        </YStack>
      </XStack>
    </Card>
  );
}
