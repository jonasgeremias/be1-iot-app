import { Bell, BellOff, Rss } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal } from 'react-native';
import { View, XStack, YStack } from 'tamagui';

import { Carousel } from '@/shared/components/Carousel';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';
import { useCurrentUserName } from '@/hooks/useCurrentUserName';
import { useDeviceCounts } from '@/hooks/useDeviceCounts';
import { monogramOf } from '@/utils/format.util';
import { getGreeting } from '@/utils/greeting.util';

import { AccessCard } from '../components/AccessCard';
import { HighlightSlide } from '../components/HighlightSlide';
import { useDashboardSummary, useHighlights } from '../hooks/useDashboard';
import type { Highlight } from '../schemas/dashboard.schema';

/** Home · Acessos (screen 02). */
export function DashboardScreen() {
  const router = useRouter();
  const summary = useDashboardSummary();
  const highlights = useHighlights();
  const userName = useCurrentUserName();
  const { deviceCount, groupCount } = useDeviceCounts();
  const [notifOpen, setNotifOpen] = useState(false);

  if (summary.isError || highlights.isError) {
    return (
      <Screen tabBarSpacing>
        <ErrorState
          onRetry={() => {
            void summary.refetch();
            void highlights.refetch();
          }}
        />
      </Screen>
    );
  }

  if (!summary.data || !highlights.data) {
    return (
      <Screen tabBarSpacing>
        <LoadingState />
      </Screen>
    );
  }

  const s = summary.data;
  const displayName = userName?.trim() || s.accountName;
  const greeting = getGreeting();
  const monogram = userName?.trim() ? monogramOf(userName) : s.monogram;

  return (
    <Screen scroll tabBarSpacing>
      {/* Greeting header */}
      <XStack px="$18" pt="$4" pb="$12" ai="center" jc="space-between">
        <YStack flex={1} pr="$10">
          <Text fontSize="$12" color="$text2" fontWeight="500">
            {greeting}
          </Text>
          <Text
            fontSize="$18"
            fontWeight="800"
            color="$text"
            letterSpacing={-0.3}
            numberOfLines={1}
          >
            {displayName}
          </Text>
        </YStack>
        <XStack gap="$10" ai="center">
          <IconButton
            accessibilityLabel="Notificações"
            size="lg"
            onPress={() => setNotifOpen(true)}
          >
            <Bell size={20} color="$text2" />
          </IconButton>
          <Avatar initials={monogram} size={42} radius={13} fontSize={14} />
        </XStack>
      </XStack>

      <YStack px="$16" gap="$12">
        <Carousel height={152}>
          {highlights.data.map((item: Highlight) => (
            <HighlightSlide key={item.id} item={item} />
          ))}
        </Carousel>

        <YStack gap="$11">
          <AccessCard
            variant="primary"
            title="Monitoramento"
            subtitle={`${deviceCount} dispositivos · ${groupCount} grupos`}
            icon={<Rss size={25} color="$white" />}
            accessibilityLabel="Abrir monitoramento"
            onPress={() => router.push('/(main)/devices')}
          />
        </YStack>
      </YStack>

      <Modal
        visible={notifOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNotifOpen(false)}
      >
        <View
          flex={1}
          bg="rgba(0,0,0,0.45)"
          ai="center"
          jc="center"
          px="$16"
          onPress={() => setNotifOpen(false)}
        >
          <Card
            radius={20}
            elevated
            p="$20"
            ai="center"
            gap="$10"
            width="100%"
            maxWidth={360}
            onPress={(e) => e.stopPropagation()}
          >
            <View width={64} height={64} br={32} bg="$surface3" ai="center" jc="center">
              <BellOff size={30} color="$text3" />
            </View>
            <Text fontSize="$17" fontWeight="800" color="$text">
              Nenhuma notificação
            </Text>
            <Text fontSize="$13" color="$text2" ta="center">
              Você está em dia. Novos avisos aparecerão aqui.
            </Text>
            <Button onPress={() => setNotifOpen(false)}>Fechar</Button>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}
