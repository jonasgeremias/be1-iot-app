import { ArrowUp } from '@tamagui/lucide-icons';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import type { SccArrow as SccArrowData } from '../schemas/device.schema';
import { useArrowBlink } from '../hooks/useArrowBlink';

const DOT_SIZE_BASE = 30;

// Disc colors in RGB 0–1 (be1-app iot-scc §4.1).
const ARROW_RGB: Record<'hot' | 'return' | 'flow', [number, number, number]> = {
  hot: [0.937, 0.325, 0.314],
  return: [0.259, 0.647, 0.961],
  flow: [0.45, 0.5, 0.55],
};

const ROTATION: Record<'up' | 'down' | 'left' | 'right', string> = {
  up: '0deg',
  right: '90deg',
  down: '180deg',
  left: '270deg',
};

function rgb([r, g, b]: [number, number, number], factor = 1): string {
  const c = (v: number) => Math.round(v * factor * 255);
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

function SccArrow({ arrow, scale }: { arrow: SccArrowData; scale: number }) {
  const blinkOn = useArrowBlink();
  // Only hot/return blink when partial; flow never blinks (be1-app §5).
  const isPartial = arrow.partial && arrow.kind !== 'flow';
  const target = isPartial ? (blinkOn ? 1 : 0.45) : 1;

  const opacity = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: target,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [target, opacity]);

  const dotSize = DOT_SIZE_BASE * scale;
  const fill = ARROW_RGB[arrow.kind];

  return (
    <View
      style={{ width: dotSize, height: dotSize, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: rgb(fill),
          borderWidth: 2,
          borderColor: rgb(fill, 0.65),
          opacity,
        }}
      />
      <View style={{ transform: [{ rotate: ROTATION[arrow.direction] }] }}>
        <ArrowUp size={dotSize * 0.75} color="#fff" />
      </View>
    </View>
  );
}

type Props = {
  arrows: SccArrowData[] | undefined;
  scale?: number;
  /** 'top' chambers (5–8): strip hangs near the inner (bottom) edge; 'bottom': top edge. */
  row: 'top' | 'bottom';
};

/** Horizontal strip of airflow arrows anchored to a chamber's inner edge. */
export function SccArrowsStrip({ arrows, scale = 1, row }: Props) {
  if (!arrows || arrows.length === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 30,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 4,
        ...(row === 'top' ? { bottom: 3 } : { top: 3 }),
      }}
    >
      {arrows.map((arrow, i) => (
        <SccArrow key={i} arrow={arrow} scale={scale} />
      ))}
    </View>
  );
}
