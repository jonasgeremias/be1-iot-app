import { Bell, Clock, Rss } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { View, XStack, YStack } from 'tamagui';

import { Carousel } from '@/shared/components/Carousel';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Avatar } from '@/shared/ui/Avatar';
import { IconButton } from '@/shared/ui/IconButton';
import { Text } from '@/shared/ui/Text';

import { AccessCard } from '../components/AccessCard';
import { HighlightSlide } from '../components/HighlightSlide';
import { useDashboardSummary, useHighlights } from '../hooks/useDashboard';
import type { Highlight } from '../schemas/dashboard.schema';

/** Home · Acessos (screen 02). */
export function DashboardScreen() {
  const router = useRouter();
  const summary = useDashboardSummary();
  const highlights = useHighlights();

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

  return (
    <Screen scroll tabBarSpacing>
      {/* Greeting header */}
      <XStack px="$18" pt="$4" pb="$12" ai="center" jc="space-between">
        <YStack>
          <Text fontSize="$12" color="$text2" fontWeight="500">
            {s.greeting}
          </Text>
          <Text fontSize="$18" fontWeight="800" color="$text" letterSpacing={-0.3}>
            {s.accountName}
          </Text>
        </YStack>
        <XStack gap="$10" ai="center">
          <View position="relative">
            <IconButton accessibilityLabel="Notificações" size="lg">
              <Bell size={20} color="$text2" />
            </IconButton>
            {s.notifications > 0 ? (
              <View
                position="absolute"
                top={-3}
                right={-3}
                minWidth={17}
                height={17}
                br={9}
                bg="$red"
                ai="center"
                jc="center"
                borderWidth={2}
                borderColor="$bg"
              >
                <Text fontSize="$10" fontWeight="700" color="$white">
                  {s.notifications}
                </Text>
              </View>
            ) : null}
          </View>
          <Avatar initials={s.monogram} size={42} radius={13} fontSize={14} />
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
            subtitle={`${s.deviceCount} dispositivos · ${s.groupCount} grupos`}
            icon={<Rss size={25} color="$white" />}
            accessibilityLabel="Abrir monitoramento"
            onPress={() => router.push('/(main)/devices')}
          />
          <AccessCard
            variant="soft"
            title="Assistências"
            subtitle="Suporte e chamados técnicos"
            icon={<Clock size={25} color="$brand" />}
            accessibilityLabel="Abrir assistências"
            onPress={() => router.push('/(main)/assist')}
          />
        </YStack>
      </YStack>
    </Screen>
  );
}
