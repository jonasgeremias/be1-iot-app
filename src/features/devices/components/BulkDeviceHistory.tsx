import { History } from '@tamagui/lucide-icons';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Spinner, View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { MonoText, Text } from '@/shared/ui/Text';

import {
  BULK_HISTORY_PRESETS,
  useIotBulkHistory,
  type BulkHistoryPreset,
} from '../hooks/useIotBulkHistory';
import type { Cb200DataPoint } from '../schemas/device.schema';
import { fmtDayMonth, fmtDayMonthHourLit, fmtHourColonMin } from '../utils/iotDates';
import { LineChartSvg } from './LineChartSvg';

type Props = {
  deviceId: string;
  referenceDate: Date | null;
};

const TEMP_COLOR = '#D32F2F';
const TEMP_SET_COLOR = '#F57C00';
const HUM_COLOR = '#1976D2';
const HUM_SET_COLOR = '#0097A7';
const CHART_H = 220;

/** Embedded PP/BULK history (temp + humidity, anchored to last reading). */
export function BulkDeviceHistory({ deviceId, referenceDate }: Props) {
  const [preset, setPreset] = useState<BulkHistoryPreset>('24h');
  const [width, setWidth] = useState(0);
  const { history, isFetching } = useIotBulkHistory(deviceId, preset, referenceDate);

  const points: Cb200DataPoint[] = history.data;
  const isEmpty = points.length === 0;

  const length = points.length;
  const xStep = Math.max(1, Math.ceil(length / 5));
  const tick = (d: Date) =>
    preset === '6h'
      ? fmtHourColonMin(d)
      : preset === '24h'
        ? fmtDayMonthHourLit(d)
        : fmtDayMonth(d);
  const xLabels = points.map((p, i) =>
    (length - 1 - i) % xStep === 0 ? tick(new Date(p.time)) : '',
  );

  let body: ReactNode;
  if (isFetching && isEmpty) {
    body = (
      <XStack height={CHART_H} ai="center" jc="center" gap="$8">
        <Spinner color="$brand" />
        <Text fontSize={15} color="$text2">
          Carregando
        </Text>
      </XStack>
    );
  } else if (isEmpty) {
    body = (
      <YStack height={CHART_H} ai="center" jc="center" gap="$8">
        <History size={32} color="$text3" />
        <Text fontSize={14} color="$text2" ta="center">
          Nenhum dado no período selecionado.
        </Text>
      </YStack>
    );
  } else {
    body = (
      <View height={CHART_H} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <LineChartSvg
          width={width}
          height={CHART_H}
          segments={6}
          xLabels={xLabels}
          series={[
            { data: points.map((p) => p.temperature), color: TEMP_COLOR },
            { data: points.map((p) => p.stTemperature), color: TEMP_SET_COLOR, withDots: false },
            { data: points.map((p) => p.humidity), color: HUM_COLOR },
            { data: points.map((p) => p.stHumidity), color: HUM_SET_COLOR, withDots: false },
          ]}
        />
      </View>
    );
  }

  return (
    <Card br={12} elevated={false} bg="$surface2" p="$12">
      <XStack ai="center" jc="space-between" mb="$8">
        <Text fontSize={14} fontWeight="700" color="$text">
          Histórico
        </Text>
        <XStack gap="$4">
          {BULK_HISTORY_PRESETS.map((p) => {
            const active = p.key === preset;
            return (
              <View
                key={p.key}
                px="$10"
                py="$4"
                br={6}
                bg={active ? '$brand' : 'transparent'}
                borderWidth={1}
                borderColor={active ? '$brand' : '$border2'}
                onPress={() => setPreset(p.key)}
                cursor="pointer"
              >
                <Text
                  fontSize={12}
                  fontWeight="600"
                  color={active ? '$white' : '$text2'}
                >
                  {p.label}
                </Text>
              </View>
            );
          })}
        </XStack>
      </XStack>

      {body}

      <XStack flexWrap="wrap" ai="center" jc="center" gap="$12" mt="$8">
        <LegendItem color={TEMP_COLOR} label="Temperatura" />
        <LegendItem color={TEMP_SET_COLOR} label="Setpoint T°" />
        <LegendItem color={HUM_COLOR} label="Umidade" />
        <LegendItem color={HUM_SET_COLOR} label="Setpoint H%" />
      </XStack>

      {!isEmpty ? (
        <MonoText fontSize={11} color="$text3" ta="center" mt="$6">
          Resolução: {history.resolution} · {history.count} pontos
        </MonoText>
      ) : null}
    </Card>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <XStack ai="center" gap="$4">
      <View width={10} height={3} br={2} bg={color} />
      <Text fontSize={11} color="$text2">
        {label}
      </Text>
    </XStack>
  );
}
