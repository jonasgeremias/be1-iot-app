import { Check, TriangleAlert } from '@tamagui/lucide-icons';
import { View, XStack, YStack } from 'tamagui';

import { Text } from '@/shared/ui/Text';

/** Alarm status banner — calm (no alarms) or alert variant. */
export function AlarmBanner({ hasAlarms }: { hasAlarms: boolean }) {
  const ok = !hasAlarms;
  return (
    <XStack
      ai="center"
      gap="$12"
      br={16}
      px="$15"
      py="$13"
      bg={ok ? '$onlineSoft' : '$redSoft'}
      borderWidth={1}
      borderColor="$border"
    >
      <View
        width={36}
        height={36}
        br={11}
        ai="center"
        jc="center"
        bg={ok ? '$online' : '$red'}
      >
        {ok ? (
          <Check size={20} color="$white" />
        ) : (
          <TriangleAlert size={20} color="$white" />
        )}
      </View>
      <YStack flex={1}>
        <Text fontSize="$13" fontWeight="800" color="$text">
          {ok ? 'Sem alarmes ativos' : 'Alarmes ativos'}
        </Text>
        <Text fontSize="$11" color="$text2">
          {ok ? 'Sistema operando normalmente' : 'Verifique os eventos críticos'}
        </Text>
      </YStack>
    </XStack>
  );
}
