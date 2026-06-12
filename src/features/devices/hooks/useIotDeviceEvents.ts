import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import type { IotEventSeverity } from '../schemas/device.schema';
import { deviceService } from '../services/device.service';

type Options = {
  severities: IotEventSeverity[];
  start: string | null;
  end: string | null;
  page: number;
  limit: number;
  enabled?: boolean;
};

/** Paginated device events with severity + period filters (be1-dashboard parity). */
export function useIotDeviceEvents(
  deviceId: string,
  { severities, start, end, page, limit, enabled = true }: Options,
) {
  const key = JSON.stringify({ severities, start, end, page, limit });

  return useQuery({
    queryKey: queryKeys.devices.events(deviceId, key),
    queryFn: () =>
      deviceService.getDeviceEvents({
        device: deviceId,
        severity: severities.length ? severities : undefined,
        start: start ?? undefined,
        end: end ?? undefined,
        page,
        limit,
      }),
    enabled: !!deviceId && enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
