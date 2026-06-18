import { Rss, Wrench } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { XStack, YStack } from 'tamagui';

import { Carousel } from '@/shared/components/Carousel';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { ProfileButton } from '@/shared/components/ProfileButton';
import { Screen } from '@/shared/layouts/Screen';
import { Text } from '@/shared/ui/Text';
import { useCurrentUserName } from '@/hooks/useCurrentUserName';
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
  const deviceCount = s.deviceCount;
  const groupCount = s.groupCount;

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
        <ProfileButton size={42} radius={13} />
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
          <AccessCard
            variant="soft"
            title="Assistências"
            subtitle="Suporte e chamados técnicos"
            icon={<Wrench size={25} color="$brand" />}
            accessibilityLabel="Abrir assistências"
            onPress={() => router.push('/(main)/assist')}
          />
        </YStack>
      </YStack>
    </Screen>
  );
}
