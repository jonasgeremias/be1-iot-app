import type { ReactNode } from 'react';
import { XStack, YStack } from 'tamagui';

import { Text } from '@/shared/ui/Text';

/**
 * Config row: optional leading icon (inline, no chip), title, optional subtitle,
 * and a trailing control (stepper, switch, value + chevron). Used on the device
 * configuration screen.
 */
type Props = {
  title: string;
  subtitle?: string;
  subtitleColor?: '$online' | '$text3';
  leadingIcon?: ReactNode;
  right: ReactNode;
  onPress?: () => void;
};

export function SettingRow({
  title,
  subtitle,
  subtitleColor = '$text3',
  leadingIcon,
  right,
  onPress,
}: Props) {
  return (
    <XStack
      ai="center"
      jc="space-between"
      gap="$12"
      px="$15"
      py="$11"
      onPress={onPress}
      {...(onPress && {
        accessibilityRole: 'button' as const,
        accessibilityLabel: title,
        cursor: 'pointer' as const,
        pressStyle: { opacity: 0.7 },
      })}
    >
      <XStack ai="center" gap="$9" flex={1} minWidth={0}>
        {leadingIcon}
        <YStack flex={1} minWidth={0}>
          <Text fontSize="$13.5" fontWeight="700" color="$text">
            {title}
          </Text>
          {subtitle ? (
            <Text fontSize="$11" fontWeight="600" color={subtitleColor}>
              {subtitle}
            </Text>
          ) : null}
        </YStack>
      </XStack>
      {right}
    </XStack>
  );
}
