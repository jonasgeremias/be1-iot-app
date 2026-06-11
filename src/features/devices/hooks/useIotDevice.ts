import { useMemo } from 'react';

import type { IotDevice } from '../schemas/device.schema';
import { useIotDevices } from './useIotDevices';

/**
 * A single device resolved from the grouped cache (the list already fetched it).
 * Carries the metadata the detail screens need: type, status, mac, nickname.
 */
export function useIotDevice(id: string) {
  const { grouped, isLoading, isError, refetch } = useIotDevices();

  const device = useMemo<IotDevice | undefined>(() => {
    if (!grouped) return undefined;
    for (const key of Object.keys(grouped)) {
      const entry = grouped[key];
      const found = entry?.devices.find((d: IotDevice) => d.id === id);
      if (found) return found;
    }
    return undefined;
  }, [grouped, id]);

  return { device, isLoading, isError, refetch };
}
