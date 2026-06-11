import { Image } from 'react-native';
import { View, XStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { MonoText, Text } from '@/shared/ui/Text';

const planta = require('@/assets/images/planta.png');

/** Secador floor-plan card ("Planta · leitura atual"). */
export function PlantaCard({ chambersLabel }: { chambersLabel: string }) {
  return (
    <Card radius={18} elevated p="$13">
      <XStack ai="center" jc="space-between" mb="$11">
        <Text fontSize="$12.5" fontWeight="800" color="$text">
          Planta · leitura atual
        </Text>
        <MonoText fontSize="$9.5" color="$text3">
          {chambersLabel}
        </MonoText>
      </XStack>
      <View
        bg="$white"
        borderWidth={1}
        borderColor="$border"
        br={14}
        px="$8"
        py="$10"
        ai="center"
      >
        <Image
          source={planta}
          style={{ width: '100%', height: 150, resizeMode: 'contain' }}
          accessibilityLabel="Planta do secador BE1"
        />
      </View>
    </Card>
  );
}
