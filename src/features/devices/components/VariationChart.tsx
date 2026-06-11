import { View, XStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Sparkline, type ChartDot } from '@/shared/components/Sparkline';
import { MonoText, Text } from '@/shared/ui/Text';

// Exact geometry from the prototype's inline SVG.
const DOT_X = [20, 61, 102, 143, 184, 225, 266, 307];
const DOT_Y = [65, 33, 70, 70, 64, 58, 64, 64];
const POLYLINE = DOT_X.map((x, i) => `${x},${DOT_Y[i]}`).join(' ');
const BANDS = [0, 82, 164, 246].map((x) => ({ x, width: 41 }));

const dots: ChartDot[] = DOT_X.map((cx, i) => ({
  cx,
  cy: DOT_Y[i]!,
  color: i === 1 ? 'amber' : 'online',
}));

/** "Variação de Temperatura" — per-chamber line + the chamber index legend. */
export function VariationChart({ chambers }: { chambers: number[] }) {
  return (
    <Card radius={18} elevated p="$14">
      <Text fontSize="$13" fontWeight="800" color="$text" mb="$10">
        Variação de Temperatura
      </Text>
      <Sparkline
        height={92}
        bands={BANDS}
        series={[{ points: POLYLINE, color: 'online', strokeWidth: 2.5 }]}
        dots={dots}
      />
      <XStack jc="space-between" mt="$8" px="$8">
        {chambers.map((label, i) => (
          <View
            key={i}
            width={21}
            height={21}
            br={11}
            ai="center"
            jc="center"
            bg={i === 1 ? '$amber' : '$online'}
          >
            <MonoText fontSize="$10" fontWeight="800" color="$white">
              {label}
            </MonoText>
          </View>
        ))}
      </XStack>
    </Card>
  );
}
