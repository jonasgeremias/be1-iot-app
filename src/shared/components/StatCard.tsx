import type { ReactNode } from 'react';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { MonoText, Text } from '@/shared/ui/Text';

/** Metric card: icon chip, optional delta badge, big mono value + label. */
type Props = {
  icon: ReactNode;
  iconBg: '$onlineSoft' | '$brandSoft' | '$amberSoft' | '$redSoft';
  value: string;
  suffix?: string;
  label: string;
  delta?: { text: string; tone: 'online' | 'red' };
};

export function StatCard({ icon, iconBg, value, suffix, label, delta }: Props) {
  return (
    <Card radius={16} elevated flex={1} p="$13">
      <XStack ai="center" jc="space-between" mb="$8">
        <XStack width={30} height={30} br={9} ai="center" jc="center" bg={iconBg}>
          {icon}
        </XStack>
        {delta ? (
          <XStack
            bg={delta.tone === 'online' ? '$onlineSoft' : '$redSoft'}
            px="$6"
            py="$2"
            br={5}
          >
            <Text
              fontSize="$10"
              fontWeight="800"
              color={delta.tone === 'online' ? '$online' : '$red'}
            >
              {delta.text}
            </Text>
          </XStack>
        ) : null}
      </XStack>
      <XStack ai="flex-end">
        <MonoText fontSize="$23" fontWeight="800" color="$text">
          {value}
        </MonoText>
        {suffix ? (
          <MonoText fontSize="$12" color="$text3">
            {suffix}
          </MonoText>
        ) : null}
      </XStack>
      <Text fontSize="$11" color="$text2" fontWeight="500">
        {label}
      </Text>
    </Card>
  );
}
