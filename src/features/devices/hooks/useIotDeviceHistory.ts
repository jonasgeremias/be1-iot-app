import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { deviceService } from '../services/device.service';
import {
  timeRangePresets,
  type TimeRangePresetOptions,
} from '../utils/timeRangePresets';

/** SCC per-chamber history for a time range/offset (be1-app useIotDeviceHistory). */
export function useIotDeviceHistory(
  deviceId: string,
  timeRange: TimeRangePresetOptions,
  timeOffset: number,
) {
  const query = useQuery({
    queryKey: queryKeys.devices.sccHistory(deviceId, timeRange, timeOffset),
    queryFn: () => {
      const preset = timeRangePresets[timeRange];
      const startDate = preset.getStart(timeOffset);
      const endDate = preset.getEnd(timeOffset);
      const start = (startDate ?? new Date()).toISOString();
      const end = (endDate ?? new Date()).toISOString();
      return deviceService.getSccHistory(deviceId, start, end);
    },
    enabled: !!deviceId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    deviceHistory: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
