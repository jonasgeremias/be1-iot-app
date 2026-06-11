import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import type { BulkHistoryResponse } from '../schemas/device.schema';
import { deviceService } from '../services/device.service';

export type BulkHistoryPreset = '6h' | '24h' | '7d' | '30d';

export const BULK_HISTORY_PRESETS: {
  key: BulkHistoryPreset;
  label: string;
  hours: number;
}[] = [
  { key: '6h', label: '6h', hours: 6 },
  { key: '24h', label: '24h', hours: 24 },
  { key: '7d', label: '7d', hours: 24 * 7 },
  { key: '30d', label: '30d', hours: 24 * 30 },
];

const EMPTY: BulkHistoryResponse = {
  deviceType: 'BULK',
  resolution: 'raw',
  first: null,
  last: null,
  count: 0,
  data: [],
};

const HOUR_MS = 3_600_000;

/**
 * PP/BULK history anchored to the last reading (be1-app §5):
 * start = ref - preset hours, end = ref.
 */
export function useIotBulkHistory(
  deviceId: string,
  preset: BulkHistoryPreset,
  referenceDate: Date | null,
) {
  const hours = BULK_HISTORY_PRESETS.find((p) => p.key === preset)?.hours ?? 24;
  const start = referenceDate
    ? new Date(referenceDate.getTime() - hours * HOUR_MS).toISOString()
    : null;
  const end = referenceDate ? referenceDate.toISOString() : null;

  const query = useQuery({
    queryKey: queryKeys.devices.bulkHistory(deviceId, preset, end ?? ''),
    queryFn: () => deviceService.getBulkHistory(deviceId, start!, end!),
    enabled: !!deviceId && !!start && !!end,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    history: query.data ?? EMPTY,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
