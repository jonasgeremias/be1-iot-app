import type { ReactNode } from 'react';
import { Inbox } from '@tamagui/lucide-icons';
import { YStack } from 'tamagui';

import { Text } from '@/shared/ui/Text';

/** Generic empty placeholder, styled to match the app's soft surfaces. */
type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, icon }: Props) {
  return (
    <YStack ai="center" jc="center" gap="$10" py="$40" px="$22">
      <YStack width={74} height={74} br={22} bg="$brandSoft" ai="center" jc="center">
        {icon ?? <Inbox size={32} color="$brand" />}
      </YStack>
      <Text fontSize="$17" fontWeight="800" color="$text" ta="center">
        {title}
      </Text>
      {description ? (
        <Text fontSize="$13" color="$text2" ta="center" maxWidth={280}>
          {description}
        </Text>
      ) : null}
    </YStack>
  );
}
