import { View, XStack, YStack } from 'tamagui';

import { BrandGradient } from '@/shared/ui/BrandGradient';
import { MonoText, Text } from '@/shared/ui/Text';

import type { Highlight } from '../schemas/dashboard.schema';

const TAG_BG = {
  feature: '$whiteA20',
  update: '$tagGreen',
  event: '$tagAmber',
  success: '$tagGreen',
} as const;

/** One dashboard carousel slide over the brand gradient. */
export function HighlightSlide({ item }: { item: Highlight }) {
  return (
    <BrandGradient
      from="brandGrad1"
      to="brandGrad2"
      start={[0.1, 0.2]}
      end={[0.9, 0.8]}
      style={{ flex: 1 }}
    >
      <YStack flex={1} px="$18" py="$16" jc="space-between" overflow="hidden">
        {/* decorative ring */}
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

        {item.branded ? (
          <XStack ai="center">
            <View bg={TAG_BG[item.tone]} px="$9" py="$4" br={7}>
              <Text fontSize="$9" fontWeight="800" color="$white" letterSpacing={0.6}>
                {item.tag}
              </Text>
            </View>
          </XStack>
        ) : (
          <XStack ai="center" gap="$9">
            <View bg={TAG_BG[item.tone]} px="$9" py="$4" br={7}>
              <Text fontSize="$9" fontWeight="800" color="$white" letterSpacing={0.6}>
                {item.tag}
              </Text>
            </View>
            {item.date ? (
              <MonoText fontSize="$10" color="$whiteA78">
                {item.date}
              </MonoText>
            ) : null}
          </XStack>
        )}

        <YStack>
          <Text
            color="$white"
            fontSize={item.branded ? '$18' : '$16.5'}
            fontWeight="800"
            letterSpacing={-0.3}
            lineHeight={item.branded ? 21 : 20}
          >
            {item.title}
          </Text>
          {item.subtitle ? (
            item.branded ? (
              <MonoText fontSize="$10.5" color="$whiteA82" mt="$8" letterSpacing={0.3}>
                {item.subtitle}
              </MonoText>
            ) : (
              <Text fontSize="$11" color="$whiteA82" mt="$7">
                {item.subtitle}
              </Text>
            )
          ) : null}
        </YStack>
      </YStack>
    </BrandGradient>
  );
}
