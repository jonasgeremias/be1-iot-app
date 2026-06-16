import { AlertTriangle, BellOff, CheckCircle2, Info } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { XStack, YStack, View } from 'tamagui';

import { AppHeader } from '@/shared/components/AppHeader';
import { ProfileButton } from '@/shared/components/ProfileButton';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Card } from '@/shared/ui/Card';
import { Separator } from '@/shared/ui/Separator';
import { Text } from '@/shared/ui/Text';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/services/notifications/notification.schema';

/** Icon chip + colors per notification tone. */
const TONE = {
  alert: { Icon: AlertTriangle, color: '$red' as const, bg: '$redSoft' as const },
  success: { Icon: CheckCircle2, color: '$online' as const, bg: '$onlineSoft' as const },
  info: { Icon: Info, color: '$brand' as const, bg: '$brandSoft' as const },
};

function NotificationRow({ item }: { item: Notification }) {
  const { Icon, color, bg } = TONE[item.tone];
  return (
    <XStack ai="flex-start" gap="$13" px="$15" py="$13">
      <XStack width={38} height={38} br={11} ai="center" jc="center" bg={bg} flexShrink={0}>
        <Icon size={19} color={color} />
      </XStack>
      <YStack flex={1} minWidth={0} gap="$2">
        <XStack ai="center" jc="space-between" gap="$8">
          <Text fontSize="$13.5" fontWeight="700" color="$text" flex={1} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read ? <View width={8} height={8} br={4} bg="$brand" flexShrink={0} /> : null}
        </XStack>
        <Text fontSize="$11.5" color="$text2" fontWeight="500">
          {item.message}
        </Text>
        <Text fontSize="$10.5" color="$text3" fontWeight="600">
          {item.time}
        </Text>
      </YStack>
    </XStack>
  );
}

/** Notificações — central list of alerts, status changes and updates. */
export function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useNotifications();

  if (isError) {
    return (
      <Screen tabBarSpacing>
        <AppHeader title="Notificações" onBack={() => router.back()} right={<ProfileButton />} />
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }
  if (isLoading || !data) {
    return (
      <Screen tabBarSpacing>
        <AppHeader title="Notificações" onBack={() => router.back()} right={<ProfileButton />} />
        <LoadingState />
      </Screen>
    );
  }

  if (data.length === 0) {
    return (
      <Screen tabBarSpacing>
        <AppHeader title="Notificações" onBack={() => router.back()} right={<ProfileButton />} />
        <YStack flex={1} ai="center" jc="center" px="$24" gap="$10">
          <View width={64} height={64} br={32} bg="$surface3" ai="center" jc="center">
            <BellOff size={30} color="$text3" />
          </View>
          <Text fontSize="$17" fontWeight="800" color="$text">
            Nenhuma notificação
          </Text>
          <Text fontSize="$13" color="$text2" ta="center">
            Você está em dia. Novos avisos aparecerão aqui.
          </Text>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarSpacing>
      <AppHeader
        title="Notificações"
        subtitle="Alertas e avisos do monitoramento"
        onBack={() => router.back()}
        right={<ProfileButton />}
      />

      <YStack px="$16" pt="$2">
        <Card radius={18} elevated>
          {data.map((item: Notification, i: number) => (
            <YStack key={item.id}>
              {i > 0 ? <Separator mx="$15" /> : null}
              <NotificationRow item={item} />
            </YStack>
          ))}
        </Card>
      </YStack>
    </Screen>
  );
}
