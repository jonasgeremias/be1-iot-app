import { Power, Wind } from '@tamagui/lucide-icons';
import { XStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

type Props = {
  on: boolean | null | undefined;
};

/** Blower state card — be1-app IotSopradorCard. */
export function IotSopradorCard({ on }: Props) {
  const isOn = on === true;
  const isOff = on === false;

  const color = isOn ? '#16A66A' : '#9CA3AF';
  const iconBg = isOn ? '$onlineSoft' : '$surface3';
  const label = isOn ? 'LIGADO' : isOff ? 'DESLIGADO' : '—';

  return (
    <Card br={12} elevated={false} flex={1} p="$12" gap="$8">
      <XStack ai="center" gap="$8">
        <XStack width={36} height={36} br={18} ai="center" jc="center" bg={iconBg}>
          {isOn ? <Wind size={22} color={color} /> : <Power size={22} color={color} />}
        </XStack>
        <Text
          fontSize={11}
          fontWeight="700"
          color="$text2"
          textTransform="uppercase"
          letterSpacing={0.4}
        >
          Soprador
        </Text>
      </XStack>
      <Text fontSize={20} fontWeight="700" color={color}>
        {label}
      </Text>
    </Card>
  );
}
