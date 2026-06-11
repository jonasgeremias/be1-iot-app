import {
  Activity,
  Bell,
  ChevronLeft,
  Clock,
  FileSpreadsheet,
  FileText,
  Menu,
  Share2,
  Thermometer,
} from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { View, XStack, YStack } from 'tamagui';

import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Sparkline } from '@/shared/components/Sparkline';
import { StatCard } from '@/shared/components/StatCard';
import { Card } from '@/shared/ui/Card';
import { IconButton } from '@/shared/ui/IconButton';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { Separator } from '@/shared/ui/Separator';
import { MonoText, Text } from '@/shared/ui/Text';

import { EventRow } from '../components/EventRow';
import { useDeviceReport } from '../hooks/useDeviceReport';
import type { ReportEvent, ReportPeriod } from '../schemas/report.schema';

const TREND_SERIES = [
  {
    points: '0,18 47,22 94,30 141,46 188,58 235,70 282,76 330,80',
    color: 'amber' as const,
    strokeWidth: 2.5,
  },
  {
    points: '0,66 47,62 94,64 141,58 188,60 235,55 282,57 330,54',
    color: 'brand' as const,
    strokeWidth: 2.5,
  },
];

function MenuRow({
  icon,
  iconBg,
  label,
  onPress,
}: {
  icon: ReactNode;
  iconBg: '$redSoft' | '$onlineSoft' | '$brandSoft';
  label: string;
  onPress: () => void;
}) {
  return (
    <XStack
      ai="center"
      gap="$10"
      px="$9"
      py="$9"
      br={10}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      cursor="pointer"
      pressStyle={{ opacity: 0.7 }}
    >
      <XStack width={26} height={26} br={8} ai="center" jc="center" bg={iconBg} flexShrink={0}>
        {icon}
      </XStack>
      <Text fontSize="$13" fontWeight="600" color="$text">
        {label}
      </Text>
    </XStack>
  );
}

/** Device detail · histórico / relatórios (screen 07). */
export function DeviceHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [period, setPeriod] = useState<ReportPeriod>('7dias');
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useDeviceReport(id ?? '', period);

  if (isError) {
    return (
      <Screen tabBarSpacing>
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }
  if (isLoading || !data) {
    return (
      <Screen tabBarSpacing>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarSpacing>
      {/* Header with export menu */}
      <View position="relative" zIndex={10}>
        <XStack px="$16" pt="$4" pb="$12" ai="center" gap="$12">
          <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
            <ChevronLeft size={19} color="$text" />
          </IconButton>
          <YStack flex={1} minWidth={0}>
            <Text fontSize="$20" fontWeight="800" color="$text" letterSpacing={-0.3}>
              Histórico
            </Text>
            <Text fontSize="$11" color="$text3">
              {data.deviceName} · {data.model}
            </Text>
          </YStack>
          <IconButton
            accessibilityLabel="Exportar e ações"
            tone="brand"
            onPress={() => setMenuOpen((v) => !v)}
          >
            <Menu size={19} color="$white" />
          </IconButton>
        </XStack>

        {menuOpen ? (
          <Card
            radius={15}
            elevated
            position="absolute"
            top={48}
            right={16}
            width={198}
            p="$7"
            zIndex={30}
          >
            <Text
              fontSize="$9.5"
              fontWeight="800"
              color="$text3"
              letterSpacing={0.6}
              px="$9"
              pt="$5"
              pb="$7"
            >
              EXPORTAR & AÇÕES
            </Text>
            <MenuRow
              icon={<FileText size={15} color="$red" />}
              iconBg="$redSoft"
              label="Exportar PDF"
              onPress={() => setMenuOpen(false)}
            />
            <MenuRow
              icon={<FileSpreadsheet size={15} color="$online" />}
              iconBg="$onlineSoft"
              label="Exportar Excel"
              onPress={() => setMenuOpen(false)}
            />
            <Separator mx="$9" my="$5" />
            <MenuRow
              icon={<Share2 size={15} color="$brand" />}
              iconBg="$brandSoft"
              label="Compartilhar"
              onPress={() => setMenuOpen(false)}
            />
          </Card>
        ) : null}
      </View>

      {/* Period tabs */}
      <YStack px="$16" pb="$8">
        <SegmentedControl<ReportPeriod>
          variant="solid"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'hoje', label: 'Hoje' },
            { value: '7dias', label: '7 dias' },
            { value: '30dias', label: '30 dias' },
            { value: 'mes', label: 'Mês' },
          ]}
        />
      </YStack>
      <MonoText ta="center" fontSize="$10.5" color="$text3" pb="$10">
        {data.rangeLabel}
      </MonoText>

      <YStack px="$16" gap="$11">
        {/* Stat grid */}
        <XStack gap="$10">
          <StatCard
            icon={<Activity size={17} color="$online" />}
            iconBg="$onlineSoft"
            value={String(data.availability)}
            suffix="%"
            label="Disponibilidade"
            delta={{ text: data.availabilityDelta, tone: 'online' }}
          />
          <StatCard
            icon={<Clock size={17} color="$brand" />}
            iconBg="$brandSoft"
            value={data.uptimeLabel}
            label="Tempo online"
          />
        </XStack>
        <XStack gap="$10">
          <StatCard
            icon={<Bell size={17} color="$amber" />}
            iconBg="$amberSoft"
            value={String(data.alarms)}
            label="Alarmes"
            delta={{ text: data.alarmsDelta, tone: 'red' }}
          />
          <StatCard
            icon={<Thermometer size={17} color="$amber" />}
            iconBg="$amberSoft"
            value={String(data.avgTemp)}
            suffix="°C"
            label="Temp média"
          />
        </XStack>

        {/* Trend */}
        <Card radius={18} elevated p="$14">
          <XStack ai="center" jc="space-between" mb="$10">
            <Text fontSize="$13" fontWeight="800" color="$text">
              Tendência operacional
            </Text>
            <XStack gap="$10">
              <XStack ai="center" gap="$5">
                <View width={9} height={3} br={2} bg="$amber" />
                <Text fontSize="$10" fontWeight="700" color="$text2">
                  Temp
                </Text>
              </XStack>
              <XStack ai="center" gap="$5">
                <View width={9} height={3} br={2} bg="$brand" />
                <Text fontSize="$10" fontWeight="700" color="$text2">
                  Umid
                </Text>
              </XStack>
            </XStack>
          </XStack>
          <Sparkline height={104} gridYs={[26, 52, 78]} series={TREND_SERIES} />
          <XStack jc="space-between" mt="$6">
            {['04/06', '06/06', '08/06', '10/06'].map((d) => (
              <MonoText key={d} fontSize="$9.5" color="$text3">
                {d}
              </MonoText>
            ))}
          </XStack>
        </Card>

        {/* Events */}
        <Card radius={18} elevated p="$14">
          <Text fontSize="$13" fontWeight="800" color="$text" mb="$11">
            Histórico de eventos
          </Text>
          <YStack gap="$10">
            {data.events.map((event: ReportEvent, i: number) => (
              <YStack key={`${event.code}-${i}`} gap="$10">
                <EventRow event={event} />
                {i < data.events.length - 1 ? <Separator /> : null}
              </YStack>
            ))}
          </YStack>
        </Card>
      </YStack>
    </Screen>
  );
}
