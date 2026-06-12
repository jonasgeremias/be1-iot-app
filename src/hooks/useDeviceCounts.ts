import { useMemo } from 'react';

import { useIotDevices } from '@/features/devices/hooks/useIotDevices';
import type { IotGroupedEntry } from '@/features/devices/schemas/device.schema';

/**
 * Cross-cutting device/group totals derived from the shared grouped-devices
 * query (same cache as the monitoring list). Lives in the shared hooks layer so
 * feature screens (e.g. the dashboard) don't reach into another feature.
 */
export function useDeviceCounts() {
  const { grouped, isLoading } = useIotDevices();

  return useMemo(() => {
    const entries: IotGroupedEntry[] = grouped
      ? (Object.values(grouped) as IotGroupedEntry[])
      : [];
    const deviceCount = entries.reduce((acc, e) => acc + e.devices.length, 0);
    const groupCount = entries.filter(
      (e) => e.group != null && e.devices.length > 0,
    ).length;
    return { deviceCount, groupCount, isLoading };
  }, [grouped, isLoading]);
}
