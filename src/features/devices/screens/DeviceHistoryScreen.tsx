import { Ban, ChevronLeft, Search, X } from '@tamagui/lucide-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { ScrollView, Spinner, View, XStack, YStack } from 'tamagui';

import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { DateField } from '@/shared/ui/DateField';
import { IconButton } from '@/shared/ui/IconButton';
import { MonoText, Text } from '@/shared/ui/Text';

import { LineChartSvg, type ChartSeries } from '../components/LineChartSvg';
import { SccTempVariationChart } from '../components/SccTempVariationChart';
import type {
  ChamberSnapshot,
  Cb200DataPoint,
  HistoryPoint,
} from '../schemas/device.schema';
import { useIotDevice } from '../hooks/useIotDevice';
import {
  useIotBulkHistoryRange,
  useIotSccHistoryRange,
} from '../hooks/useIotHistoryRange';
import { useIotLatestData } from '../hooks/useIotLatestData';
import { fmtDayMonthHourMin } from '../utils/iotDates';
import { formatMac } from '../utils/iotConstants';
import { EVENT_PRESETS } from '../utils/iotEvents';

const dayStartISO = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).toISOString();
const dayEndISO = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString();

function buildXLabels(times: string[]): string[] {
  const n = times.length;
  const step = Math.max(1, Math.ceil(n / 5));
  return times.map((t, i) =>
    (n - 1 - i) % step === 0 ? fmtDayMonthHourMin(new Date(t)) : '',
  );
}

// 9 distinct chamber colors (1..8 + return).
const CHAMBER_COLORS = [
  '#E53935',
  '#FB8C00',
  '#FBC02D',
  '#43A047',
  '#00ACC1',
  '#1E88E5',
  '#5E35B1',
  '#D81B60',
  '#6D4C41',
];
const chamberColor = (k: string) =>
  CHAMBER_COLORS[(parseInt(k, 10) - 1) % CHAMBER_COLORS.length] ?? '#8A99AC';

function alignSeries(
  points: HistoryPoint[] | undefined,
  n: number,
  field: 'temperature' | 'humidity',
): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const v = points?.[i]?.[field];
    out.push(v == null ? NaN : v);
  }
  return out;
}

const PAD_L = 34;
const PAD_R = 10;
const CHART_H = 220;
const TEMP_COLOR = '#D32F2F';
const TEMP_SET_COLOR = '#F57C00';
const HUM_COLOR = '#1976D2';
const HUM_SET_COLOR = '#0097A7';

/** Multi-line chart with tap-to-pick-a-moment. */
function TapChart({
  series,
  xLabels,
  ySuffix,
  n,
  onIndex,
}: {
  series: ChartSeries[];
  xLabels: string[];
  ySuffix?: string;
  n: number;
  onIndex?: (i: number) => void;
}) {
  const [w, setW] = useState(0);
  const handlePress = (e: GestureResponderEvent) => {
    if (!onIndex || w <= 0 || n <= 1) return;
    const x = e.nativeEvent.locationX;
    const plotW = w - PAD_L - PAD_R;
    if (plotW <= 0) return;
    const rel = (x - PAD_L) / plotW;
    onIndex(Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1)))));
  };
  return (
    <View
      height={CHART_H}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      onPress={onIndex ? handlePress : undefined}
    >
      {w > 0 ? (
        <LineChartSvg
          width={w}
          height={CHART_H}
          segments={6}
          ySuffix={ySuffix}
          series={series}
          xLabels={xLabels}
        />
      ) : null}
    </View>
  );
}

function BulkChart({ points }: { points: Cb200DataPoint[] }) {
  const [w, setW] = useState(0);
  return (
    <View height={CHART_H} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <LineChartSvg
          width={w}
          height={CHART_H}
          segments={6}
          series={[
            { data: points.map((p) => p.temperature ?? NaN), color: TEMP_COLOR },
            { data: points.map((p) => p.stTemperature ?? NaN), color: TEMP_SET_COLOR, withDots: false },
            { data: points.map((p) => p.humidity ?? NaN), color: HUM_COLOR },
            { data: points.map((p) => p.stHumidity ?? NaN), color: HUM_SET_COLOR, withDots: false },
          ]}
          xLabels={buildXLabels(points.map((p) => p.time))}
        />
      ) : null}
    </View>
  );
}

/** Device detail · histórico por período (DateTimePicker). */
export function DeviceHistoryScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const { device, isLoading: isLoadingDevice } = useIotDevice(deviceId);
  const { latestData, isLoading: isLoadingLatest } = useIotLatestData(deviceId);
  const deviceType = device?.deviceType ?? latestData?.deviceType;
  const isScc = deviceType === 'SCC';
  const isBulkLike = deviceType === 'PP' || deviceType === 'BULK';

  const [fromDate, setFromDate] = useState(
    () => new Date(Date.now() - 7 * 86_400_000),
  );
  const [toDate, setToDate] = useState(() => new Date());
  const [range, setRange] = useState(() => ({
    start: dayStartISO(new Date(Date.now() - 7 * 86_400_000)),
    end: dayEndISO(new Date()),
  }));
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [moment, setMoment] = useState<number | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>('7d');

  const sccQuery = useIotSccHistoryRange(deviceId, range.start, range.end, isScc);
  const bulkQuery = useIotBulkHistoryRange(deviceId, range.start, range.end, isBulkLike);

  const sccHistory = sccQuery.data;
  const chamberKeys = useMemo(
    () =>
      sccHistory
        ? Object.keys(sccHistory)
            .filter((k) => (sccHistory[k]?.length ?? 0) > 0)
            .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        : [],
    [sccHistory],
  );

  const momentChambers = useMemo<Record<string, ChamberSnapshot> | null>(() => {
    if (moment == null || !sccHistory) return null;
    const out: Record<string, ChamberSnapshot> = {};
    for (const k of chamberKeys) {
      const p = sccHistory[k]?.[moment];
      if (p) {
        out[k] = {
          time: p.time,
          temperature: p.temperature,
          humidity: p.humidity,
          hotAirActuatorState: null,
          returnAirActuatorState: null,
        };
      }
    }
    return out;
  }, [moment, sccHistory, chamberKeys]);

  const applyPreset = (k: string) => {
    const r = EVENT_PRESETS.find((p) => p.key === k)!.range();
    setActivePreset(k);
    setFromDate(new Date(r.start));
    setToDate(new Date(r.end));
    setRange({ start: r.start, end: r.end });
    setMoment(null);
  };
  const onBuscar = () => {
    if (fromDate > toDate) {
      setError('A data inicial deve ser anterior à final.');
      return;
    }
    setError(null);
    setMoment(null);
    setActivePreset(null);
    setRange({ start: dayStartISO(fromDate), end: dayEndISO(toDate) });
  };

  const header = (
    <XStack px="$16" pt="$4" pb="$8" ai="center" gap="$12">
      <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
        <ChevronLeft size={19} color="$text" />
      </IconButton>
      <YStack flex={1} minWidth={0}>
        <Text fontSize="$19" fontWeight="800" color="$text" letterSpacing={-0.3}>
          Histórico
        </Text>
        {device ? (
          <Text fontSize="$11" color="$text3" numberOfLines={1}>
            {device.nickname || formatMac(device.macAddress)}
          </Text>
        ) : null}
      </YStack>
    </XStack>
  );

  if (!deviceType && (isLoadingDevice || isLoadingLatest)) {
    return (
      <Screen tabBarSpacing>
        {header}
        <LoadingState />
      </Screen>
    );
  }

  if (deviceType && !isScc && !isBulkLike) {
    return (
      <Screen tabBarSpacing>
        {header}
        <YStack ai="center" jc="center" p="$32" gap="$12">
          <Ban size={44} color="$text3" />
          <Text fontSize={15} ta="center" color="$text2">
            Histórico não disponível para este tipo de dispositivo.
          </Text>
        </YStack>
      </Screen>
    );
  }

  const isFetching = isScc ? sccQuery.isFetching : bulkQuery.isFetching;
  const bulkPoints: Cb200DataPoint[] = bulkQuery.data?.data ?? [];

  const refKey = chamberKeys.reduce(
    (best, k) =>
      (sccHistory?.[k]?.length ?? 0) > (sccHistory?.[best]?.length ?? 0)
        ? k
        : best,
    chamberKeys[0] ?? '',
  );
  const refPoints: HistoryPoint[] = sccHistory?.[refKey] ?? [];
  const times = refPoints.map((p) => p.time);
  const n = times.length;
  const visibleChambers = chamberKeys.filter((k) => !hidden.includes(k));
  const tempSeries: ChartSeries[] = visibleChambers.map((k) => ({
    data: alignSeries(sccHistory?.[k], n, 'temperature'),
    color: chamberColor(k),
    withDots: false,
  }));
  const humSeries: ChartSeries[] = visibleChambers.map((k) => ({
    data: alignSeries(sccHistory?.[k], n, 'humidity'),
    color: chamberColor(k),
    withDots: false,
  }));
  const xLabels = buildXLabels(times);

  const isEmpty = isScc ? chamberKeys.length === 0 : bulkPoints.length === 0;
  const momentTime =
    moment != null && times[moment]
      ? fmtDayMonthHourMin(new Date(times[moment]!))
      : '';

  return (
    <Screen scroll tabBarSpacing>
      {header}

      {/* period presets */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
      >
        {EVENT_PRESETS.map((p) => {
          const active = p.key === activePreset;
          return (
            <View
              key={p.key}
              px="$12"
              py="$7"
              br={9}
              bg={active ? '$brand' : '$surface'}
              borderWidth={1}
              borderColor={active ? '$brand' : '$border'}
              onPress={() => applyPreset(p.key)}
              cursor="pointer"
            >
              <Text
                fontSize={12}
                fontWeight={active ? '700' : '600'}
                color={active ? '$white' : '$text2'}
              >
                {p.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* date range */}
      <YStack px="$16" pt="$10" gap="$10">
        <XStack gap="$10">
          <DateField
            label="De"
            value={fromDate}
            onChange={setFromDate}
            accessibilityLabel="Data inicial"
          />
          <DateField
            label="Até"
            value={toDate}
            onChange={setToDate}
            accessibilityLabel="Data final"
          />
        </XStack>
        {error ? (
          <Text fontSize="$11" color="$red">
            {error}
          </Text>
        ) : null}
        <Button
          onPress={onBuscar}
          disabled={isFetching}
          opacity={isFetching ? 0.7 : 1}
          icon={
            isFetching ? (
              <Spinner color="$white" />
            ) : (
              <Search size={17} color="$white" />
            )
          }
        >
          {isFetching ? 'Buscando…' : 'Buscar'}
        </Button>
      </YStack>

      {isFetching && isEmpty ? (
        <YStack pt="$12">
          <LoadingState />
        </YStack>
      ) : isEmpty ? (
        <YStack px="$16" pt="$12">
          <EmptyState
            title="Sem dados"
            description="Nenhum dado encontrado no período selecionado."
          />
        </YStack>
      ) : isScc ? (
        <>
          {/* chamber legend / toggle */}
          <XStack px="$16" pt="$10" gap="$6" flexWrap="wrap">
            {chamberKeys.map((k) => {
              const active = !hidden.includes(k);
              const color = chamberColor(k);
              return (
                <XStack
                  key={k}
                  ai="center"
                  gap="$5"
                  px="$8"
                  py="$5"
                  br={8}
                  borderWidth={1}
                  borderColor={active ? color : '$border'}
                  bg={active ? color + '18' : '$surface'}
                  opacity={active ? 1 : 0.55}
                  onPress={() =>
                    setHidden((prev) =>
                      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
                    )
                  }
                  cursor="pointer"
                >
                  <View width={10} height={10} br={5} bg={color} />
                  <MonoText fontSize={12} fontWeight="700" color="$text2">
                    {k === '9' ? 'R' : k}
                  </MonoText>
                </XStack>
              );
            })}
          </XStack>

          <YStack px="$16" pt="$12" gap="$11">
            <Card radius={16} elevated={false} bg="$surface2" p="$12">
              <Text fontSize={13} fontWeight="700" color="$text" mb="$4">
                Temperatura · todas as câmaras
              </Text>
              <Text fontSize={10.5} color="$text3" mb="$6">
                Toque no gráfico para ver a variação do momento.
              </Text>
              <TapChart
                series={tempSeries}
                xLabels={xLabels}
                ySuffix="º"
                n={n}
                onIndex={setMoment}
              />
            </Card>

            <Card radius={16} elevated={false} bg="$surface2" p="$12">
              <Text fontSize={13} fontWeight="700" color="$text" mb="$6">
                Umidade · todas as câmaras
              </Text>
              <TapChart
                series={humSeries}
                xLabels={xLabels}
                ySuffix="%"
                n={n}
                onIndex={setMoment}
              />
            </Card>

            {momentChambers ? (
              <Card radius={16} elevated={false} bg="$surface2" p="$12">
                <XStack ai="center" jc="space-between" mb="$6">
                  <Text fontSize={13} fontWeight="700" color="$text">
                    Variação · {momentTime}
                  </Text>
                  <IconButton
                    accessibilityLabel="Fechar variação"
                    size="sm"
                    onPress={() => setMoment(null)}
                  >
                    <X size={16} color="$text2" />
                  </IconButton>
                </XStack>
                <SccTempVariationChart
                  chambers={momentChambers}
                  scale="fahrenheit"
                  highVariationThresholdF={15}
                />
              </Card>
            ) : null}
          </YStack>
        </>
      ) : (
        <YStack px="$16" pt="$12">
          <Card radius={16} elevated={false} bg="$surface2" p="$12">
            <BulkChart points={bulkPoints} />
            <XStack flexWrap="wrap" ai="center" jc="center" gap="$12" mt="$8">
              {[
                { c: TEMP_COLOR, l: 'Temperatura' },
                { c: TEMP_SET_COLOR, l: 'Setpoint T°' },
                { c: HUM_COLOR, l: 'Umidade' },
                { c: HUM_SET_COLOR, l: 'Setpoint H%' },
              ].map((it) => (
                <XStack key={it.l} ai="center" gap="$4">
                  <View width={10} height={3} br={2} bg={it.c} />
                  <Text fontSize={11} color="$text2">
                    {it.l}
                  </Text>
                </XStack>
              ))}
            </XStack>
          </Card>
        </YStack>
      )}
    </Screen>
  );
}
