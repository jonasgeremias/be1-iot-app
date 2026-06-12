import { TriangleAlert } from '@tamagui/lucide-icons';
import { YStack } from 'tamagui';

import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';

/** Generic error placeholder with optional retry. */
type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Algo deu errado',
  description = 'Não foi possível carregar os dados. Tente novamente.',
  onRetry,
}: Props) {
  return (
    <YStack ai="center" jc="center" gap="$12" py="$40" px="$22">
      <YStack width={74} height={74} br={22} bg="$redSoft" ai="center" jc="center">
        <TriangleAlert size={32} color="$red" />
      </YStack>
      <Text fontSize="$17" fontWeight="800" color="$text" ta="center">
        {title}
      </Text>
      <Text fontSize="$13" color="$text2" ta="center" maxWidth={280}>
        {description}
      </Text>
      {onRetry ? (
        <Button variant="outline" block={false} onPress={onRetry} px="$22">
          Tentar novamente
        </Button>
      ) : null}
    </YStack>
  );
}
