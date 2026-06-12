import Svg, { Line, Polyline, Rect, Circle } from 'react-native-svg';
import { useTheme } from 'tamagui';

import type { AppTheme } from '@/theme/themes';

type ColorKey = keyof AppTheme;

export type ChartSeries = {
  /** Raw "x,y x,y …" point string in viewBox coordinates (pixel-faithful). */
  points: string;
  color: ColorKey;
  strokeWidth?: number;
};

export type ChartDot = {
  cx: number;
  cy: number;
  r?: number;
  color: ColorKey;
};

export type ChartBand = {
  x: number;
  width: number;
  color?: ColorKey;
};

/**
 * Lightweight line chart driven by exact viewBox coordinates from the
 * prototype's inline SVGs (temperature variation, history, trend charts).
 * Colors resolve from theme tokens so they adapt to dark mode.
 */
type Props = {
  height: number;
  viewBoxWidth?: number;
  /** Horizontal gridline Y positions. */
  gridYs?: number[];
  /** Vertical background bands (variation chart). */
  bands?: ChartBand[];
  series: ChartSeries[];
  dots?: ChartDot[];
};

export function Sparkline({
  height,
  viewBoxWidth = 330,
  gridYs = [],
  bands = [],
  series,
  dots = [],
}: Props) {
  const theme = useTheme();
  const c = (key: ColorKey) => theme[key].get();

  return (
    <Svg
      width="100%"
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${height}`}
      preserveAspectRatio="none"
    >
      {bands.map((b, i) => (
        <Rect
          key={`b${i}`}
          x={b.x}
          y={0}
          width={b.width}
          height={height}
          fill={c(b.color ?? 'surface2')}
        />
      ))}
      {gridYs.map((y, i) => (
        <Line
          key={`g${i}`}
          x1={0}
          y1={y}
          x2={viewBoxWidth}
          y2={y}
          stroke={c('border')}
          strokeWidth={1}
        />
      ))}
      {series.map((s, i) => (
        <Polyline
          key={`s${i}`}
          points={s.points}
          fill="none"
          stroke={c(s.color)}
          strokeWidth={s.strokeWidth ?? 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {dots.map((d, i) => (
        <Circle key={`d${i}`} cx={d.cx} cy={d.cy} r={d.r ?? 3.4} fill={c(d.color)} />
      ))}
    </Svg>
  );
}
