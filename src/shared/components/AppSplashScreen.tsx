import { YStack } from 'tamagui';

import { appConfig } from '@/config/app.config';
import { BrandGradient } from '@/shared/ui/BrandGradient';
import { MonoText } from '@/shared/ui/Text';

import { SplashLogo } from './SplashLogo';

/** Global branded splash shown while app-level bootstrapping finishes. */
export function AppSplashScreen() {
  return (
    <BrandGradient
      from="brandGrad1"
      to="brandGrad2"
      start={[0.2, 0]}
      end={[0.8, 1]}
      style={{ flex: 1 }}
    >
      <YStack flex={1} ai="center" jc="center">
        <SplashLogo />
      </YStack>
      <YStack position="absolute" bottom={70} left={0} right={0} ai="center" gap="$15">
        <YStack width={150} height={4} br={2} bg="$whiteA20" overflow="hidden">
          <YStack width="42%" height="100%" br={2} bg="$white" />
        </YStack>
        <MonoText color="$whiteA78" fontSize="$11" letterSpacing={1}>
          CARREGANDO...
        </MonoText>
      </YStack>
      <MonoText
        position="absolute"
        bottom={28}
        left={0}
        right={0}
        ta="center"
        color="$whiteA50"
        fontSize="$10"
        letterSpacing={0.5}
      >
        {appConfig.company} - {appConfig.appVersion}
      </MonoText>
    </BrandGradient>
  );
}
