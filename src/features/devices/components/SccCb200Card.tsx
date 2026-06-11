import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import type { Cb200Snapshot } from '../schemas/device.schema';
import { Cb200StatCards } from './Cb200StatCards';

type Props = {
  cb200Data: Cb200Snapshot | null;
};

/** SCC CB200 sub-card — be1-app SccCb200Card (reuses the PP/BULK cluster). */
export function SccCb200Card({ cb200Data }: Props) {
  return (
    <Card br={12} elevated={false} bg="$surface2" p="$12" gap="$10">
      <Text
        fontSize={12}
        fontWeight="700"
        color="$text2"
        textTransform="uppercase"
        letterSpacing={0.4}
      >
        CB200
      </Text>
      <Cb200StatCards snapshot={cb200Data} />
    </Card>
  );
}
