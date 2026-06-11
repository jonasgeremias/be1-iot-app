import { Spinner, YStack } from 'tamagui';

import { Text } from '@/shared/ui/Text';

/** Centered loading indicator with optional label. */
type Props = {
  label?: string;
};

export function LoadingState({ label = 'Carregando…' }: Props) {
  return (
    <YStack ai="center" jc="center" gap="$12" py="$40" flex={1}>
      <Spinner size="large" color="$brand" />
      <Text fontSize="$12.5" color="$text2">
        {label}
      </Text>
    </YStack>
  );
}
