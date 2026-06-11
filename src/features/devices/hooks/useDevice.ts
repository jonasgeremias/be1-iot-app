import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { deviceService } from '../services/device.service';

/** Real-time detail for a single device. */
export function useDevice(id: string) {
  return useQuery({
    queryKey: queryKeys.devices.detail(id),
    queryFn: () => deviceService.getDeviceDetail(id),
    enabled: !!id,
  });
}
