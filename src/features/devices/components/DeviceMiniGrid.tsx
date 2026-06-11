import { View, XStack } from 'tamagui';

import { MonoText } from '@/shared/ui/Text';

import type { CellTone, Chamber } from '../schemas/device.schema';

const TONE_BG = {
  online: '$online',
  amber: '$amber',
  muted: '$cellMuted',
} as const satisfies Record<CellTone, string>;

/** The 1×main + 4×2 temperature grid shown at the left of each device card. */
export function DeviceMiniGrid({
  mainTemp,
  mainTone,
  chambers,
}: {
  mainTemp: number;
  mainTone: CellTone;
  chambers: Chamber[];
}) {
  return (
    <XStack gap="$3">
      <View
        width={26}
        bg={TONE_BG[mainTone]}
        br={7}
        ai="center"
        jc="center"
      >
        <MonoText fontSize="$11" fontWeight="700" color="$white">
          {mainTemp}
        </MonoText>
      </View>
      <XStack width={22 * 4 + 3 * 3} flexWrap="wrap" gap="$3">
        {chambers.map((c, i) => (
          <View
            key={i}
            width={22}
            height={22}
            br={5}
            bg={TONE_BG[c.tone]}
            ai="center"
            jc="center"
          >
            <MonoText fontSize="$9.5" fontWeight="600" color="$white">
              {c.value}
            </MonoText>
          </View>
        ))}
      </XStack>
    </XStack>
  );
}
