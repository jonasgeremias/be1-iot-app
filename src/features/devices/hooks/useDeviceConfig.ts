import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { deviceService } from '../services/device.service';

/** Editable configuration for a single device. */
export function useDeviceConfig(id: string) {
  return useQuery({
    queryKey: queryKeys.devices.config(id),
    queryFn: () => deviceService.getDeviceConfig(id),
    enabled: !!id,
  });
}
