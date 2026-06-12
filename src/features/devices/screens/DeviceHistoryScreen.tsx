import { Ban, ChevronLeft, Search } from '@tamagui/lucide-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Spinner, View, XStack, YStack } from 'tamagui';

import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { IconButton } from '@/shared/ui/IconButton';
import { Input } from '@/shared/ui/Input';
import { MonoText, Text } from '@/shared/ui/Text';

import { LineChartSvg } from '../components/LineChartSvg';
import type { Cb200DataPoint, HistoryPoint } from '../schemas/device.schema';
import { useIotDevice } from '../hooks/useIotDevice';
import {
  useIotBulkHistoryRange,
  useIotSccHistoryRange,
} from '../hooks/useIotHistoryRange';
import { useIotLatestData } from '../hooks/useIotLatestData';
import { fmtDayMonthHourMin } from '../utils/iotDates';
import { formatMac } from '../utils/iotConstants';
import { getTemperatureColor } from '../utils/temperatureColor';

const pad2 = (n: number) => String(n).padStart(2, '0');
const fmtDmy = (d: Date) =>
  `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;

function maskDate(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

function dmyToISO(s: string, endOfDay: boolean): string | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dt = new Date(
    Number(m[3]),
    Number(m[2]) - 1,
    Number(m[1]),
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
  );
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

function buildXLabels(times: string[]): string[] {
  const n = times.length;
  const step = Math.max(1, Math.ceil(n / 5));
  return times.map((t, i) =>
    (n - 1 - i) % step === 0 ? fmtDayMonthHourMin(new Date(t)) : '',
  );
}

function ChartBox({
  height,
  render,
}: {
  height: number;
  render: (w: number) => ReactNode;
}) {
  const [w, setW] = useState(0);
  return (
    <View height={height} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? render(w) : null}
    </View>
  );
}

const CHART_H = 240;
const TEMP_COLOR = '#D32F2F';
const TEMP_SET_COLOR = '#F57C00';
const HUM_COLOR = '#1976D2';
const HUM_SET_COLOR = '#0097A7';

/** Device detail · histórico por período (input de data) — SCC / PP / BULK. */
export function DeviceHistoryScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const { device, isLoading: isLoadingDevice } = useIotDevice(deviceId);
  const { latestData, isLoading: isLoadingLatest } = useIotLatestData(deviceId);
  const deviceType = device?.deviceType ?? latestData?.deviceType;
  const isScc = deviceType === 'SCC';
  const isBulkLike = deviceType === 'PP' || deviceType === 'BULK';

  const initFrom = useMemo(
    () => fmtDmy(new Date(Date.now() - 7 * 86_400_000)),
    [],
  );
  const initTo = useMemo(() => fmtDmy(new Date()), []);

  const [fromText, setFromText] = useState(initFrom);
  const [toText, setToText] = useState(initTo);
  const [range, setRange] = useState(() => ({
    start: dmyToISO(initFrom, false) ?? '',
    end: dmyToISO(initTo, true) ?? '',
  }));
  const [error, setError] = useState<string | null>(null);
  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);

  const sccQuery = useIotSccHistoryRange(deviceId, range.start, range.end, isScc);
  const bulkQuery = useIotBulkHistoryRange(
    deviceId,
    range.start,
    range.end,
    isBulkLike,
  );

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

  useEffect(() => {
    if (!selectedChamber && chamberKeys.length) {
      const first = chamberKeys[0];
      if (first) setSelectedChamber(first);
    }
  }, [chamberKeys, selectedChamber]);

  const onBuscar = () => {
    const s = dmyToISO(fromText, false);
    const e = dmyToISO(toText, true);
    if (!s || !e) {
      setError('Datas inválidas (use dd/mm/aaaa).');
      return;
    }
    if (new Date(s) > new Date(e)) {
      setError('A data inicial deve ser anterior à final.');
      return;
    }
    setError(null);
    setSelectedChamber(null);
    setRange({ start: s, end: e });
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
  const chamberPoints: HistoryPoint[] = selectedChamber
    ? (sccHistory?.[selectedChamber] ?? [])
    : [];
  const isEmpty = isScc ? chamberKeys.length === 0 : bulkPoints.length === 0;

  // SCC series
  const temps = chamberPoints.map((p) => p.temperature ?? NaN);
  const finiteTemps = temps.filter((v) => Number.isFinite(v));
  const avg = finiteTemps.length
    ? (Math.min(...finiteTemps) + Math.max(...finiteTemps)) / 2
    : 50;
  const sccColor = getTemperatureColor(avg);

  return (
    <Screen scroll tabBarSpacing>
      {header}

      {/* date range inputs */}
      <YStack px="$16" gap="$10">
        <XStack gap="$10">
          <YStack flex={1}>
            <Input
              label="De"
              accessibilityLabel="Data inicial"
              value={fromText}
              onChangeText={(t) => setFromText(maskDate(t))}
              placeholder="dd/mm/aaaa"
            />
          </YStack>
          <YStack flex={1}>
            <Input
              label="Até"
              accessibilityLabel="Data final"
              value={toText}
              onChangeText={(t) => setToText(maskDate(t))}
              placeholder="dd/mm/aaaa"
            />
          </YStack>
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

      {/* SCC chamber chips */}
      {isScc && chamberKeys.length > 0 ? (
        <XStack px="$16" pt="$12" gap="$6" flexWrap="wrap">
          {chamberKeys.map((k) => {
            const active = k === selectedChamber;
            return (
              <View
                key={k}
                width={40}
                height={36}
                br={9}
                ai="center"
                jc="center"
                bg={active ? '$brand' : '$surface'}
                borderWidth={1}
                borderColor={active ? '$brand' : '$border'}
                onPress={() => setSelectedChamber(k)}
                cursor="pointer"
              >
                <MonoText
                  fontSize={13}
                  fontWeight="700"
                  color={active ? '$white' : '$text2'}
                >
                  {k === '9' ? 'R' : k}
                </MonoText>
              </View>
            );
          })}
        </XStack>
      ) : null}

      {/* chart */}
      <YStack px="$16" pt="$12">
        {isFetching && isEmpty ? (
          <LoadingState />
        ) : isEmpty ? (
          <EmptyState
            title="Sem dados"
            description="Nenhum dado encontrado no período selecionado."
          />
        ) : isScc ? (
          <Card radius={16} elevated={false} bg="$surface2" p="$12">
            <ChartBox
              height={CHART_H}
              render={(w) => (
                <LineChartSvg
                  width={w}
                  height={CHART_H}
                  segments={6}
                  ySuffix="º"
                  series={[{ data: temps, color: sccColor }]}
                  xLabels={buildXLabels(chamberPoints.map((p) => p.time))}
                />
              )}
            />
          </Card>
        ) : (
          <Card radius={16} elevated={false} bg="$surface2" p="$12">
            <ChartBox
              height={CHART_H}
              render={(w) => (
                <LineChartSvg
                  width={w}
                  height={CHART_H}
                  segments={6}
                  series={[
                    { data: bulkPoints.map((p) => p.temperature ?? NaN), color: TEMP_COLOR },
                    { data: bulkPoints.map((p) => p.stTemperature ?? NaN), color: TEMP_SET_COLOR, withDots: false },
                    { data: bulkPoints.map((p) => p.humidity ?? NaN), color: HUM_COLOR },
                    { data: bulkPoints.map((p) => p.stHumidity ?? NaN), color: HUM_SET_COLOR, withDots: false },
                  ]}
                  xLabels={buildXLabels(bulkPoints.map((p) => p.time))}
                />
              )}
            />
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
        )}
      </YStack>
    </Screen>
  );
}
