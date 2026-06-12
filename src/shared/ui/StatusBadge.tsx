import { XStack } from 'tamagui';

import type { DeviceStatus } from '@/constants/app.constants';

import { PulseDot } from './PulseDot';
import { Text } from './Text';

type StatusMeta = {
  label: string;
  color: 'online' | 'red' | 'amber';
  soft: '$onlineSoft' | '$redSoft' | '$amberSoft';
};

const META: Record<DeviceStatus, StatusMeta> = {
  online: { label: 'Online', color: 'online', soft: '$onlineSoft' },
  offline: { label: 'Offline', color: 'red', soft: '$redSoft' },
  alert: { label: 'Alerta', color: 'amber', soft: '$amberSoft' },
};

type Props = {
  status: DeviceStatus;
  /** Override the default Portuguese label. */
  label?: string;
  /** Larger variant used on the detail header banner. */
  size?: 'sm' | 'md';
};

/**
 * Status pill — soft background + colored dot + label, matching the
 * online/offline/alerta badges throughout the prototype. The online dot pulses.
 */
export function StatusBadge({ status, label, size = 'sm' }: Props) {
  const meta = META[status];
  const fontSize = size === 'md' ? '$11.5' : '$10.5';
  return (
    <XStack
      ai="center"
      gap={size === 'md' ? '$6' : '$5'}
      bg={meta.soft}
      px={size === 'md' ? '$11' : '$8'}
      py={size === 'md' ? '$5' : '$3'}
      br={size === 'md' ? '$9' : '$7'}
    >
      <PulseDot color={meta.color} size={size === 'md' ? 7 : 6} pulse={status === 'online'} />
      <Text fontSize={fontSize} fontWeight="800" color={`$${meta.color}`}>
        {label ?? meta.label}
      </Text>
    </XStack>
  );
}
