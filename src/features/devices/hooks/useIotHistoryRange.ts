import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { deviceService } from '../services/device.service';

/** SCC per-chamber history for an explicit date range (Histórico tab). */
export function useIotSccHistoryRange(
  deviceId: string,
  start: string,
  end: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.devices.sccHistory(deviceId, `range:${start}:${end}`, 0),
    queryFn: () => deviceService.getSccHistory(deviceId, start, end),
    enabled: enabled && !!deviceId && !!start && !!end,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

/** PP/BULK CB200 history for an explicit date range (Histórico tab). */
export function useIotBulkHistoryRange(
  deviceId: string,
  start: string,
  end: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.devices.bulkHistory(deviceId, 'range', `${start}:${end}`),
    queryFn: () => deviceService.getBulkHistory(deviceId, start, end),
    enabled: enabled && !!deviceId && !!start && !!end,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
