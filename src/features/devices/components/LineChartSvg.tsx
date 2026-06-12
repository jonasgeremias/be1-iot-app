import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

export type ChartSeries = {
  data: number[];
  color: string;
  withDots?: boolean;
};

type Props = {
  width: number;
  height: number;
  series: ChartSeries[];
  /** One label per x index ('' to skip). Length should match the series. */
  xLabels: string[];
  ySuffix?: string;
  segments?: number;
  /** Optional y-axis anchors to keep the plot from collapsing. */
  minYAnchor?: number;
  maxYAnchor?: number;
};

const PAD_L = 34;
const PAD_R = 10;
const PAD_T = 10;
const PAD_B = 22;

/** Lightweight multi-series line chart (react-native-svg) — replaces chart-kit. */
export function LineChartSvg({
  width,
  height,
  series,
  xLabels,
  ySuffix = '',
  segments = 5,
  minYAnchor,
  maxYAnchor,
}: Props) {
  const all = series.flatMap((s) => s.data).filter((v) => Number.isFinite(v));
  if (width <= 0 || all.length === 0) return null;

  const n = Math.max(...series.map((s) => s.data.length));
  let minY = Math.min(...all);
  let maxY = Math.max(...all);
  if (minYAnchor != null) minY = Math.min(minY, minYAnchor);
  if (maxYAnchor != null) maxY = Math.max(maxY, maxYAnchor);
  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  }
  const span = maxY - minY;

  const plotL = PAD_L;
  const plotR = width - PAD_R;
  const plotW = plotR - plotL;
  const plotT = PAD_T;
  const plotB = height - PAD_B;
  const plotH = plotB - plotT;

  const x = (i: number) => (n <= 1 ? plotL + plotW / 2 : plotL + (i / (n - 1)) * plotW);
  const y = (v: number) => plotT + (1 - (v - minY) / span) * plotH;

  const gridYs: number[] = [];
  for (let s = 0; s <= segments; s++) {
    gridYs.push(minY + (span * s) / segments);
  }

  return (
    <Svg width={width} height={height}>
      {/* gridlines + y labels */}
      {gridYs.map((v, i) => (
        <Line
          key={`g-${i}`}
          x1={plotL}
          y1={y(v)}
          x2={plotR}
          y2={y(v)}
          stroke="rgba(138,153,172,0.25)"
          strokeWidth={1}
          strokeDasharray="2,3"
        />
      ))}
      {gridYs.map((v, i) => (
        <SvgText
          key={`yl-${i}`}
          x={plotL - 4}
          y={y(v) + 3}
          fontSize={9}
          fill="#8A99AC"
          textAnchor="end"
        >
          {`${Math.round(v)}${ySuffix}`}
        </SvgText>
      ))}

      {/* series */}
      {series.map((s, si) => {
        const pts = s.data
          .map((v, i) => (Number.isFinite(v) ? `${x(i)},${y(v)}` : null))
          .filter(Boolean)
          .join(' ');
        return (
          <Polyline
            key={`s-${si}`}
            points={pts}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}

      {/* dots */}
      {series.map((s, si) =>
        s.withDots === false
          ? null
          : s.data.map((v, i) =>
              Number.isFinite(v) ? (
                <Circle key={`d-${si}-${i}`} cx={x(i)} cy={y(v)} r={1.8} fill={s.color} />
              ) : null,
            ),
      )}

      {/* x labels */}
      {xLabels.map((lbl, i) =>
        lbl ? (
          <SvgText
            key={`xl-${i}`}
            x={x(i)}
            y={height - 6}
            fontSize={9}
            fill="#8A99AC"
            textAnchor="middle"
          >
            {lbl}
          </SvgText>
        ) : null,
      )}
    </Svg>
  );
}
