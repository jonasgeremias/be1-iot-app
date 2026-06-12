import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { deviceService } from '../services/device.service';
import { getLatestReadingDate } from '../utils/latestData';

/** Card / detail real-time polling interval (be1-app §3.2). */
export const LATEST_CARD_POLL_MS = 30_000;

/** Latest snapshot for a device, with the normalized last-reading timestamp. */
export function useIotLatestData(deviceId: string, refetchInterval?: number | false) {
  const query = useQuery({
    queryKey: queryKeys.devices.latest(deviceId),
    queryFn: () => deviceService.getLatestData(deviceId),
    enabled: !!deviceId,
    staleTime: 30_000,
    refetchInterval: refetchInterval ?? false,
  });

  return {
    latestData: query.data,
    lastFetch: getLatestReadingDate(query.data),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
