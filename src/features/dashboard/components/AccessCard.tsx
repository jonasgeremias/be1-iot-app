import { ChevronRight } from '@tamagui/lucide-icons';
import type { ReactNode } from 'react';
import { View, XStack, YStack } from 'tamagui';

import { BrandGradient } from '@/shared/ui/BrandGradient';
import { Text } from '@/shared/ui/Text';

/**
 * Large home access card. `primary` = brand gradient (Monitoramento);
 * `soft` = brand-soft surface with border (Assistências).
 */
type Props = {
  variant: 'primary' | 'soft';
  title: string;
  subtitle: string;
  icon: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
};

export function AccessCard({
  variant,
  title,
  subtitle,
  icon,
  onPress,
  accessibilityLabel,
}: Props) {
  const isPrimary = variant === 'primary';

  const inner = (
    <XStack ai="center" gap="$14" px="$18" height={84} overflow="hidden">
      <View
        position="absolute"
        right={-30}
        top={-20}
        width={110}
        height={110}
        br={55}
        borderWidth={1}
        borderColor={isPrimary ? '$whiteA13' : '$border'}
      />
      <YStack
        width={48}
        height={48}
        br={14}
        ai="center"
        jc="center"
        bg={isPrimary ? '$whiteA16' : '$white'}
        {...(!isPrimary && {
          shadowColor: '$shadowColor',
          shadowOpacity: 1,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2,
        })}
      >
        {icon}
      </YStack>
      <YStack flex={1}>
        <Text fontSize="$17" fontWeight="800" color={isPrimary ? '$white' : '$brand'}>
          {title}
        </Text>
        <Text fontSize="$11.5" color={isPrimary ? '$whiteA82' : '$text2'}>
          {subtitle}
        </Text>
      </YStack>
      <ChevronRight size={20} color={isPrimary ? '$white' : '$brand'} />
    </XStack>
  );

  if (isPrimary) {
    return (
      <YStack
        br={18}
        overflow="hidden"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        cursor="pointer"
        pressStyle={{ opacity: 0.94 }}
        shadowColor="$brandGrad2"
        shadowOpacity={0.5}
        shadowRadius={20}
        shadowOffset={{ width: 0, height: 14 }}
        elevation={5}
      >
        <BrandGradient from="brandGrad1" to="brandGrad2" start={[0, 0.2]} end={[1, 0.8]}>
          {inner}
        </BrandGradient>
      </YStack>
    );
  }

  return (
    <View
      br={18}
      overflow="hidden"
      bg="$brandSoft"
      borderWidth={1}
      borderColor="$border"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      cursor="pointer"
      pressStyle={{ opacity: 0.94 }}
    >
      {inner}
    </View>
  );
}
