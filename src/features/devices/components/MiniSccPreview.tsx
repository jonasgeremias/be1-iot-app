import { Spinner, View, XStack, YStack } from 'tamagui';

import { MonoText } from '@/shared/ui/Text';

import type { ChamberSnapshot } from '../schemas/device.schema';
import { getTemperatureColor } from '../utils/temperatureColor';

type Props = {
  chambers: Record<string, ChamberSnapshot> | null;
  isLoading?: boolean;
};

const CELL = 24;
const GAP = 3;
const NO_DATA = '#3E5970';

/** Compact 2×4 (+return) SCC chamber preview for the list card. */
export function MiniSccPreview({ chambers, isLoading }: Props) {
  const colorFor = (key: string): string => {
    const c = chambers?.[key];
    return c ? getTemperatureColor(c.temperature) : NO_DATA;
  };

  const labelFor = (key: string): string => {
    const t = chambers?.[key]?.temperature;
    return t != null ? `${Math.round(t)}` : 'N/A';
  };

  if (isLoading) {
    return (
      <View ai="center" jc="center">
        <Spinner color="$brand" />
      </View>
    );
  }

  const Cell = ({ k, h }: { k: string; h: number }) => (
    <View width={CELL} height={h} br={3} mr={GAP} ai="center" jc="center" bg={colorFor(k)}>
      <MonoText fontSize={9} fontWeight="700" color="#FFFFFF">
        {labelFor(k)}
      </MonoText>
    </View>
  );

  return (
    <XStack ai="center">
      {/* return / furnace (9) */}
      <Cell k="9" h={CELL * 2 + GAP} />
      <YStack>
        <XStack mb={GAP}>
          {['5', '6', '7', '8'].map((k) => (
            <Cell key={k} k={k} h={CELL} />
          ))}
        </XStack>
        <XStack>
          {['4', '3', '2', '1'].map((k) => (
            <Cell key={k} k={k} h={CELL} />
          ))}
        </XStack>
      </YStack>
    </XStack>
  );
}
