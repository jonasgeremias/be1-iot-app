import type { ReactNode } from 'react';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { XStack, YStack } from 'tamagui';

import { IconButton } from '@/shared/ui/IconButton';
import { MonoText, Text } from '@/shared/ui/Text';

/**
 * Screen header — optional back button, title + optional subtitle, optional
 * trailing action(s). Matches the device/profile/assist headers in the
 * prototype (38px surface back square, 20/800 title, 11/text3 subtitle).
 */
type Props = {
  title: string;
  subtitle?: string;
  /** Render the subtitle in JetBrains Mono (e.g. "SCC · 02:53:…"). */
  subtitleMono?: boolean;
  onBack?: () => void;
  /** Trailing node(s): icon buttons, status badge, etc. */
  right?: ReactNode;
  /** Center the title (Perfil / Recuperar conta layouts). */
  centered?: boolean;
  titleSize?: '$17' | '$18' | '$19' | '$20';
};

export function AppHeader({
  title,
  subtitle,
  subtitleMono = false,
  onBack,
  right,
  centered = false,
  titleSize = '$20',
}: Props) {
  const Subtitle = subtitleMono ? MonoText : Text;
  return (
    <XStack ai="center" gap="$12" px="$16" pt="$4" pb="$12">
      {onBack ? (
        <IconButton accessibilityLabel="Voltar" onPress={onBack}>
          <ChevronLeft size={19} color="$text" />
        </IconButton>
      ) : null}
      <YStack flex={1} minWidth={0} ai={centered ? 'center' : 'flex-start'}>
        <Text
          fontSize={titleSize}
          fontWeight="800"
          color="$text"
          letterSpacing={-0.3}
        >
          {title}
        </Text>
        {subtitle ? (
          <Subtitle fontSize="$11" color="$text3">
            {subtitle}
          </Subtitle>
        ) : null}
      </YStack>
      {right}
    </XStack>
  );
}
