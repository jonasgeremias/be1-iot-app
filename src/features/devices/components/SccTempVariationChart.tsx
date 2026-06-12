import { AlertTriangle } from '@tamagui/lucide-icons';
import { Fragment, useState } from 'react';
import { View, XStack } from 'tamagui';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { Card } from '@/shared/ui/Card';
import { MonoText, Text } from '@/shared/ui/Text';

import type { ChamberSnapshot } from '../schemas/device.schema';
import { firstAirflowChambers, hottestFirstCyclicOrder } from '../utils/sccAirflow';
import { getTemperatureColor } from '../utils/temperatureColor';

type Chambers = Record<string, ChamberSnapshot> | null | undefined;

type Props = {
  chambers: Chambers;
  scale?: 'celsius' | 'fahrenheit';
  highVariationThresholdF?: number;
};

type ChartPoint = { chamber: number; canonicalF: number; display: number };

const PAD_L = 8;
const PAD_R = 8;
const PAD_TOP = 22;
const PAD_BOTTOM = 34;
const HEIGHT = 220;

function buildPoints(chambers: Chambers, scale: 'celsius' | 'fahrenheit') {
  const hot: (number | null | undefined)[] = [];
  const ret: (number | null | undefined)[] = [];
  const temps: (number | null | undefined)[] = [];
  for (let i = 0; i < 8; i++) {
    const snap = chambers?.[String(i + 1)];
    hot.push(snap?.hotAirActuatorState ?? null);
    ret.push(snap?.returnAirActuatorState ?? null);
    temps.push(snap?.temperature ?? null);
  }
  // Use the real airflow when available, else order by hottest → cyclic 1→8.
  const order = firstAirflowChambers(hot, ret) ?? hottestFirstCyclicOrder(temps);
  const points: ChartPoint[] = [];
  for (const idx of order) {
    const t = chambers?.[String(idx + 1)]?.temperature;
    if (t == null || isNaN(t)) continue;
    points.push({
      chamber: idx + 1,
      canonicalF: t,
      display: scale === 'celsius' ? Math.round(((t - 32) * 5) / 9) : Math.round(t),
    });
  }
  return points;
}

/** "Variação de Temperatura" spatial chart in airflow order — be1-app port. */
export function SccTempVariationChart({
  chambers,
  scale = 'fahrenheit',
  highVariationThresholdF = 15,
}: Props) {
  const [width, setWidth] = useState(0);

  const unit = scale === 'celsius' ? '°C' : '°F';
  const points = buildPoints(chambers, scale);
  const n = points.length;

  const drops: number[] = [];
  if (highVariationThresholdF > 0) {
    for (let i = 0; i < n - 1; i++) {
      const a = points[i]!;
      const b = points[i + 1]!;
      if (b.canonicalF - a.canonicalF < -highVariationThresholdF) {
        drops.push(i);
      }
    }
  }

  const renderBody = () => {
    if (n < 2 || width <= 0) {
      return (
        <SvgText x={width / 2} y={HEIGHT / 2} fontSize={20} fill="#8A99AC" textAnchor="middle">
          —
        </SvgText>
      );
    }

    const anchor: [number, number] = scale === 'celsius' ? [10, 65] : [50, 150];
    const displays = points.map((p) => p.display);
    const yMin = Math.min(...displays, anchor[0]);
    const yMax = Math.max(...displays, anchor[1]);
    const sp = yMax - yMin || 1;

    const plotL = PAD_L;
    const plotR = width - PAD_R;
    const plotW = plotR - plotL;
    const plotTop = PAD_TOP;
    const plotBottom = HEIGHT - PAD_BOTTOM;
    const plotH = plotBottom - plotTop;
    const colW = plotW / n;

    const x = (i: number) => plotL + (i + 0.5) * colW;
    const y = (d: number) => plotTop + (1 - (d - yMin) / sp) * plotH;

    const x0 = x(0);
    const xLast = x(n - 1);
    const midColor = getTemperatureColor(points[Math.floor(n / 2)]!.canonicalF);

    let prevOffset = -1;
    const lineStops = points.map((p, i) => {
      let off = xLast === x0 ? 0 : (x(i) - x0) / (xLast - x0);
      if (off <= prevOffset) off = prevOffset + 0.0001;
      prevOffset = off;
      return { off: Math.min(1, off), color: getTemperatureColor(p.canonicalF) };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.display)}`)
      .join(' ');
    const areaPath =
      `M ${x0} ${plotBottom} ` +
      points.map((p, i) => `L ${x(i)} ${y(p.display)}`).join(' ') +
      ` L ${xLast} ${plotBottom} Z`;

    const gridlines: number[] = [];
    for (let v = Math.ceil(yMin / 10) * 10; v <= yMax; v += 10) gridlines.push(v);

    return (
      <>
        <Defs>
          <SvgLinearGradient
            id="lineGrad"
            x1={x0}
            y1={0}
            x2={xLast}
            y2={0}
            gradientUnits="userSpaceOnUse"
          >
            {lineStops.map((s, i) => (
              <Stop key={i} offset={s.off} stopColor={s.color} />
            ))}
          </SvgLinearGradient>
          <SvgLinearGradient
            id="areaGrad"
            x1={0}
            y1={plotTop}
            x2={0}
            y2={plotBottom}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0} stopColor={midColor} stopOpacity={0.22} />
            <Stop offset={1} stopColor={midColor} stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>

        {points.map((_, i) =>
          i % 2 === 0 ? (
            <Rect
              key={`stripe-${i}`}
              x={plotL + i * colW}
              y={plotTop}
              width={colW}
              height={plotH}
              fill="rgba(138,153,172,0.12)"
            />
          ) : null,
        )}

        {drops.map((i) => (
          <Rect
            key={`band-${i}`}
            x={x(i)}
            y={plotTop}
            width={x(i + 1) - x(i)}
            height={plotH}
            fill="rgba(220,38,38,0.08)"
          />
        ))}

        {gridlines.map((v) => (
          <Line
            key={`grid-${v}`}
            x1={plotL}
            y1={y(v)}
            x2={plotR}
            y2={y(v)}
            stroke="rgba(138,153,172,0.25)"
            strokeWidth={1}
          />
        ))}

        <Path d={areaPath} fill="url(#areaGrad)" />
        <Path
          d={linePath}
          stroke="url(#lineGrad)"
          strokeWidth={2}
          strokeLinejoin="round"
          fill="none"
        />

        {drops.map((i) => (
          <Rect
            key={`bb-${i}`}
            x={x(i)}
            y={plotTop}
            width={x(i + 1) - x(i)}
            height={plotH}
            fill="none"
            stroke="rgba(220,38,38,1)"
            strokeWidth={1}
            strokeDasharray="6,4"
          />
        ))}

        {points.map((p, i) => (
          <Fragment key={`pt-${i}`}>
            <SvgText x={x(i)} y={y(p.display) - 8} fontSize={10} fill="#506377" textAnchor="middle">
              {`${p.display}${unit}`}
            </SvgText>
            <Circle cx={x(i)} cy={y(p.display)} r={5} fill={getTemperatureColor(p.canonicalF)} />
            <Circle cx={x(i)} cy={y(p.display)} r={2.3} fill="#FFFFFF" />
          </Fragment>
        ))}

        {points.map((p, i) => (
          <Fragment key={`badge-${i}`}>
            <Circle cx={x(i)} cy={plotBottom + 16} r={9} fill={getTemperatureColor(p.canonicalF)} />
            <SvgText
              x={x(i)}
              y={plotBottom + 20}
              fontSize={11}
              fontWeight="bold"
              fill="#FFFFFF"
              textAnchor="middle"
            >
              {p.chamber}
            </SvgText>
          </Fragment>
        ))}
      </>
    );
  };

  const callouts =
    n >= 2 && width > 0
      ? (() => {
          const plotL = PAD_L;
          const plotW = width - PAD_R - plotL;
          const colW = plotW / n;
          const x = (i: number) => plotL + (i + 0.5) * colW;
          return drops.map((i) => {
            const delta = Math.abs(points[i + 1]!.display - points[i]!.display);
            const cx = (x(i) + x(i + 1)) / 2;
            return { i, cx, delta };
          });
        })()
      : [];

  return (
    <Card br={12} elevated={false} bg="$surface2" p="$12">
      <Text fontSize={14} fontWeight="700" color="$text" mb="$8">
        Variação de Temperatura
      </Text>

      <View
        height={HEIGHT}
        position="relative"
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 ? (
          <Svg width={width} height={HEIGHT}>
            {renderBody()}
          </Svg>
        ) : null}

        {callouts.map((c) => (
          <XStack
            key={`callout-${c.i}`}
            position="absolute"
            top={2}
            left={c.cx - 26}
            width={52}
            ai="center"
            jc="center"
            gap="$2"
            pointerEvents="none"
          >
            <AlertTriangle size={12} color="#DC2626" />
            <MonoText fontSize={10} color="#DC2626" fontWeight="700">
              {c.delta}
              {unit}
            </MonoText>
          </XStack>
        ))}
      </View>
    </Card>
  );
}
