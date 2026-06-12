import { ArrowLeft, ArrowRight, History } from '@tamagui/lucide-icons';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Spinner, View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import type { HistoryPoint } from '../schemas/device.schema';
import { fmtDayMonthHourMin } from '../utils/iotDates';
import { getTemperatureColor } from '../utils/temperatureColor';
import type { TimeRangePreset } from '../utils/timeRangePresets';
import { LineChartSvg } from './LineChartSvg';

type Props = {
  chamberHistory: HistoryPoint[];
  isFetching: boolean;
  selectedChamber: string | null;
  timeRange: TimeRangePreset;
  timeOffset: number;
  onMoveOffset: (move: 1 | -1) => void;
  onResetOffset: () => void;
  onOpenPicker: () => void;
  onGoToLastDataPeriod: () => void;
};

const CHART_H = 220;

/** SCC per-chamber temperature history with range navigation — be1-app HistoryChart. */
export function ChamberHistoryChart({
  chamberHistory,
  isFetching,
  selectedChamber,
  timeRange,
  timeOffset,
  onMoveOffset,
  onResetOffset,
  onOpenPicker,
  onGoToLastDataPeriod,
}: Props) {
  const [width, setWidth] = useState(0);

  const isEmpty = chamberHistory.length === 0;
  // Backend may send null readings — map to NaN (LineChartSvg skips them) and
  // compute the scale/color only over finite values.
  const temps = chamberHistory.map((p) => p.temperature ?? NaN);
  const finiteTemps = temps.filter((v) => Number.isFinite(v));
  const minTemp = finiteTemps.length ? Math.min(...finiteTemps) : 0;
  const maxTemp = finiteTemps.length ? Math.max(...finiteTemps) : 50;
  const avgColor = getTemperatureColor((minTemp + maxTemp) / 2);

  const buttonsDisabled = isFetching || !selectedChamber;
  const canGoForward = !buttonsDisabled && timeOffset > 0;

  const length = chamberHistory.length;
  const xStep = Math.max(1, Math.ceil(length / 5));
  const xLabels = chamberHistory.map((p, i) =>
    (length - 1 - i) % xStep === 0 ? timeRange.formatTick(new Date(p.time)) : '',
  );

  let body: ReactNode;
  if (isFetching || !selectedChamber) {
    body = (
      <XStack flex={1} ai="center" jc="center" gap="$8">
        <Spinner color="$brand" />
        <Text fontSize={15} color="$text2">
          Carregando
        </Text>
      </XStack>
    );
  } else if (isEmpty) {
    body = (
      <YStack flex={1} ai="center" jc="center" gap="$8">
        <History size={32} color="$text3" />
        <Text fontSize={14} color="$text2" ta="center" maxWidth="70%">
          Nenhum dado encontrado no período selecionado.
        </Text>
      </YStack>
    );
  } else {
    body = (
      <View flex={1} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <LineChartSvg
          width={width}
          height={CHART_H}
          series={[{ data: temps, color: avgColor }]}
          xLabels={xLabels}
          ySuffix="º"
          segments={6}
        />
      </View>
    );
  }

  const first = chamberHistory[0];
  const last = chamberHistory[chamberHistory.length - 1];
  const bottomLabel =
    first && last && chamberHistory.length > 1
      ? `${fmtDayMonthHourMin(new Date(first.time))}  –  ${fmtDayMonthHourMin(new Date(last.time))}`
      : (() => {
          const s = timeRange.getStart(timeOffset);
          const e = timeRange.getEnd(timeOffset) ?? new Date();
          return s ? `${fmtDayMonthHourMin(s)}  –  ${fmtDayMonthHourMin(e)}` : '…';
        })();

  return (
    <Card br={12} elevated={false} bg="$surface2" pt="$12" pb="$8">
      <View height={CHART_H} px="$8">
        {body}
      </View>

      <XStack ai="center" jc="space-between" px="$4" mt="$4">
        <View
          p="$8"
          onPress={buttonsDisabled ? undefined : () => onMoveOffset(1)}
          onLongPress={buttonsDisabled ? undefined : onGoToLastDataPeriod}
          cursor={buttonsDisabled ? undefined : 'pointer'}
        >
          <ArrowLeft size={24} color={buttonsDisabled ? '$text3' : '$brand'} />
        </View>

        <View
          bg={isFetching ? '$text3' : '$brand'}
          br={8}
          py="$8"
          px="$24"
          minWidth="55%"
          ai="center"
          onPress={isFetching ? undefined : onOpenPicker}
          cursor={isFetching ? undefined : 'pointer'}
        >
          <Text fontSize={14} color="$white" fontWeight="600">
            {timeRange.label}
          </Text>
        </View>

        <View
          p="$8"
          onPress={!canGoForward ? undefined : () => onMoveOffset(-1)}
          onLongPress={!canGoForward ? undefined : onResetOffset}
          cursor={!canGoForward ? undefined : 'pointer'}
        >
          <ArrowRight size={24} color={canGoForward ? '$brand' : '$text3'} />
        </View>
      </XStack>

      <Text fontSize={12} color="$text3" ta="center" pt="$4">
        {bottomLabel}
      </Text>
    </Card>
  );
}
