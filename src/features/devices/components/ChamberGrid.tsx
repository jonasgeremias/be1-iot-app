import { Spinner, View, XStack, YStack } from 'tamagui';

import { MonoText } from '@/shared/ui/Text';

import type { ChamberSnapshot } from '../schemas/device.schema';
import { getTemperatureColor } from '../utils/temperatureColor';
import { SccArrowsStrip } from './SccArrowsStrip';

type Chambers = Record<string, ChamberSnapshot> | null | undefined;

type Props = {
  latestData: Chambers;
  isLoading: boolean;
  selectedChamber: string | null;
  onSelectChamber: (key: string) => void;
};

const UPPER = [5, 6, 7, 8];
const LOWER = [4, 3, 2, 1];

function ChamberCard({
  chamberIndex,
  data,
  isLoading,
  isSelected,
  onPress,
  row,
}: {
  chamberIndex: number;
  data: ChamberSnapshot | undefined;
  isLoading: boolean;
  isSelected: boolean;
  onPress: () => void;
  row?: 'top' | 'bottom';
}) {
  const color = data ? getTemperatureColor(data.temperature) : '#E5E7EB';
  const label = chamberIndex === 9 ? 'R' : String(chamberIndex);

  return (
    <View flex={1} height="100%" p="$4" ai="center" jc="center" onPress={onPress} cursor="pointer">
      <YStack
        flex={1}
        width="100%"
        ai="center"
        jc="center"
        gap="$6"
        bg="$surface2"
        br={8}
        borderColor={color}
        borderWidth={isSelected ? 3 : 1}
        position="relative"
      >
        {/* airflow arrows (not on the return/furnace cell) */}
        {row && chamberIndex !== 9 && !isLoading ? (
          <SccArrowsStrip arrows={data?.arrows} scale={0.7} row={row} />
        ) : null}
        {isLoading ? (
          <Spinner color="$brand" />
        ) : (
          <View width={36} height={36} br={18} bg={color} ai="center" jc="center">
            <MonoText fontSize={16} fontWeight="700" color="#FFFFFF">
              {label}
            </MonoText>
          </View>
        )}
        <YStack ai="center" gap="$1">
          <MonoText fontSize={12} fontWeight="700" color="$text">
            {data?.temperature != null ? `${data.temperature} ºC` : 'N/A'}
          </MonoText>
          <MonoText fontSize={12} fontWeight="600" color="$text2">
            {data?.humidity != null ? `${data.humidity} %` : 'N/A'}
          </MonoText>
        </YStack>
      </YStack>
    </View>
  );
}

/** SCC 8+1 chamber grid — be1-app ChamberGrid. */
export function ChamberGrid({
  latestData,
  isLoading,
  selectedChamber,
  onSelectChamber,
}: Props) {
  const hasFurnace = !!latestData?.['9'];

  return (
    <XStack width="100%" height={280}>
      {hasFurnace ? (
        <View width="20%" height="100%">
          {/* row + flex:1 so the return cell fills the column (be1-app parity). */}
          <XStack flex={1}>
            <ChamberCard
              chamberIndex={9}
              data={latestData?.['9']}
              isLoading={isLoading}
              isSelected={selectedChamber === '9'}
              onPress={() => onSelectChamber('9')}
            />
          </XStack>
        </View>
      ) : null}

      <YStack flex={1} height="100%">
        <XStack height="50%">
          {UPPER.map((n) => (
            <ChamberCard
              key={n}
              chamberIndex={n}
              data={latestData?.[String(n)]}
              isLoading={isLoading}
              isSelected={selectedChamber === String(n)}
              onPress={() => onSelectChamber(String(n))}
              row="top"
            />
          ))}
        </XStack>
        <XStack height="50%">
          {LOWER.map((n) => (
            <ChamberCard
              key={n}
              chamberIndex={n}
              data={latestData?.[String(n)]}
              isLoading={isLoading}
              isSelected={selectedChamber === String(n)}
              onPress={() => onSelectChamber(String(n))}
              row="bottom"
            />
          ))}
        </XStack>
      </YStack>
    </XStack>
  );
}
