import { useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Sparkline } from '@/shared/components/Sparkline';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { MonoText, Text } from '@/shared/ui/Text';

type Period = '6h' | '24h' | '7d' | '30d';

const TEMP_SERIES = [
  { points: '0,16 55,18 110,17 165,19 200,20 240,40 290,52 330,54', color: 'amber' as const },
  { points: '0,22 55,23 110,22 165,24 200,25 240,34 290,44 330,46', color: 'online' as const },
  { points: '0,13 55,14 110,15 165,14 200,16 240,30 290,40 330,42', color: 'brand' as const },
];

const HUMIDITY_SERIES = [
  { points: '0,30 55,28 110,31 165,29 200,28 240,24 290,22 330,20', color: 'brand' as const },
  { points: '0,38 55,37 110,38 165,36 200,35 240,33 290,31 330,30', color: 'online' as const },
];

/** In-detail history card with period selector and temp/humidity trends. */
export function HistoryCard() {
  const [period, setPeriod] = useState<Period>('30d');

  return (
    <Card radius={18} elevated p="$14">
      <XStack ai="center" jc="space-between" mb="$12">
        <Text fontSize="$13" fontWeight="800" color="$text">
          Histórico
        </Text>
        <SegmentedControl<Period>
          variant="pill"
          value={period}
          onChange={setPeriod}
          options={[
            { value: '6h', label: '6h' },
            { value: '24h', label: '24h' },
            { value: '7d', label: '7d' },
            { value: '30d', label: '30d' },
          ]}
        />
      </XStack>

      <Text fontSize="$10" fontWeight="700" color="$text2" letterSpacing={0.4} mb="$5">
        TEMPERATURA (°C)
      </Text>
      <Sparkline height={72} gridYs={[18, 40]} series={TEMP_SERIES} />

      <Text
        fontSize="$10"
        fontWeight="700"
        color="$text2"
        letterSpacing={0.4}
        mt="$10"
        mb="$5"
      >
        UMIDADE (%)
      </Text>
      <Sparkline height={58} gridYs={[20, 40]} series={HUMIDITY_SERIES} />

      <XStack jc="space-between" mt="$6">
        {['06/06', '08/06', '10/06'].map((d) => (
          <MonoText key={d} fontSize="$9.5" color="$text3">
            {d}
          </MonoText>
        ))}
      </XStack>
    </Card>
  );
}
