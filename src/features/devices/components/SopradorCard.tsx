import { Wind } from '@tamagui/lucide-icons';
import { View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { PulseDot } from '@/shared/ui/PulseDot';
import { Text } from '@/shared/ui/Text';

/** Blower status card ("SOPRADOR · LIGADO"). */
export function SopradorCard({ on }: { on: boolean }) {
  return (
    <Card radius={16} elevated p="$13" px="$15">
      <XStack ai="center" gap="$13">
        <View
          width={42}
          height={42}
          br={12}
          ai="center"
          jc="center"
          bg={on ? '$onlineSoft' : '$surface3'}
        >
          <Wind size={22} color={on ? '$online' : '$text3'} />
        </View>
        <YStack>
          <Text fontSize="$10.5" fontWeight="800" color="$text2" letterSpacing={0.6}>
            SOPRADOR
          </Text>
          <Text
            fontSize="$20"
            fontWeight="800"
            color={on ? '$online' : '$text3'}
            letterSpacing={-0.2}
          >
            {on ? 'LIGADO' : 'DESLIGADO'}
          </Text>
        </YStack>
        <XStack ml="auto" ai="center" gap="$7">
          <PulseDot color={on ? 'online' : 'text3'} size={9} pulse={on} />
          <Text fontSize="$11" color="$text3" fontWeight="600">
            {on ? 'ativo' : 'inativo'}
          </Text>
        </XStack>
      </XStack>
    </Card>
  );
}
