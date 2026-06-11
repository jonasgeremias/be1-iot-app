import { Image } from 'react-native';
import { View, XStack, YStack } from 'tamagui';

import { BrandGradient } from '@/shared/ui/BrandGradient';
import { PulseDot } from '@/shared/ui/PulseDot';
import { Text } from '@/shared/ui/Text';

const logo = require('@/assets/images/be1-blue.png');

/** Brand hero with live-attendance badge (top of the Assistências screen). */
export function SupportHero({ online }: { online: boolean }) {
  return (
    <View br={20} overflow="hidden">
      <BrandGradient from="brandGrad1" to="brandGrad2" start={[0.15, 0]} end={[0.85, 1]}>
        <YStack ai="center" px="$18" py="$20" gap="$12">
          <View
            position="absolute"
            right={-40}
            top={-30}
            width={150}
            height={150}
            br={75}
            borderWidth={1}
            borderColor="$whiteA13"
          />
          <YStack
            bg="$white"
            br={18}
            px="$14"
            py="$12"
            shadowColor="$black"
            shadowOpacity={0.35}
            shadowRadius={24}
            shadowOffset={{ width: 0, height: 10 }}
            elevation={4}
          >
            <Image
              source={logo}
              style={{ height: 34, width: 92, resizeMode: 'contain' }}
              accessibilityLabel="BE1"
            />
          </YStack>
          <Text col="$white" fontSize="$14" fontWeight="700" mt="$3">
            Suporte e assistência técnica
          </Text>
          {online ? (
            <XStack ai="center" gap="$7" bg="$whiteA16" br={9} px="$12" py="$6">
              <PulseDot color="online" size={8} pulse />
              <Text col="$white" fontSize="$11.5" fontWeight="700">
                Atendimento online agora
              </Text>
            </XStack>
          ) : null}
        </YStack>
      </BrandGradient>
    </View>
  );
}
