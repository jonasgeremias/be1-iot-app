import type { ReactNode } from 'react';
import { XStack, YStack } from 'tamagui';

import { MonoText, Text } from '@/shared/ui/Text';

/**
 * Generic list row: optional icon chip, an optional small label above the
 * title, the title, an optional subtitle below it, and an optional trailing
 * node (chevron, toggle, value text). Covers the profile, settings, support
 * and config rows in the prototype.
 */
type Props = {
  icon?: ReactNode;
  iconBg?: '$surface3' | '$brandSoft' | '$onlineSoft';
  iconSize?: number;
  /** Small muted label above the title (e.g. "E-mail"). */
  label?: string;
  title: string;
  /** Render the title in JetBrains Mono (phone, CPF, IP, MAC). */
  mono?: boolean;
  /** Small text below the title (e.g. "Ativada"). */
  subtitle?: string;
  subtitleColor?: '$online' | '$text3' | '$text2';
  right?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function ListRow({
  icon,
  iconBg = '$surface3',
  iconSize = 34,
  label,
  title,
  mono = false,
  subtitle,
  subtitleColor = '$text3',
  right,
  onPress,
  accessibilityLabel,
}: Props) {
  const Title = mono ? MonoText : Text;
  return (
    <XStack
      ai="center"
      gap="$13"
      px="$15"
      py="$13"
      onPress={onPress}
      {...(onPress && {
        accessibilityRole: 'button' as const,
        accessibilityLabel: accessibilityLabel ?? title,
        cursor: 'pointer' as const,
        pressStyle: { opacity: 0.7 },
      })}
    >
      {icon ? (
        <XStack
          width={iconSize}
          height={iconSize}
          br={iconSize >= 36 ? 11 : iconSize >= 34 ? 10 : 9}
          ai="center"
          jc="center"
          bg={iconBg}
          flexShrink={0}
        >
          {icon}
        </XStack>
      ) : null}
      <YStack flex={1} minWidth={0}>
        {label ? (
          <Text fontSize="$10.5" color="$text3" fontWeight="600">
            {label}
          </Text>
        ) : null}
        <Title fontSize="$13.5" fontWeight="700" color="$text">
          {title}
        </Title>
        {subtitle ? (
          <Text fontSize="$10.5" fontWeight="600" color={subtitleColor}>
            {subtitle}
          </Text>
        ) : null}
      </YStack>
      {right}
    </XStack>
  );
}
