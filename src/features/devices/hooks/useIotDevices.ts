import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import type { IotDevicesGrouped } from '../schemas/device.schema';
import { deviceService } from '../services/device.service';

/**
 * Grouped devices for the listing — be1-app useIotDevices. Optional polling
 * (pass LATEST_CARD_POLL_MS on the list). Rename mutation patches the cache
 * optimistically.
 */
export function useIotDevices(refetchInterval?: number | false) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.devices.grouped,
    queryFn: () => deviceService.getGroupedDevices(),
    staleTime: 30_000,
    refetchInterval: refetchInterval ?? false,
  });

  const rename = useMutation({
    mutationFn: ({ id, nickname }: { id: string; nickname: string }) =>
      deviceService.updateDeviceName(id, nickname),
    onSuccess: (updated) => {
      queryClient.setQueryData<IotDevicesGrouped>(
        queryKeys.devices.grouped,
        (old: IotDevicesGrouped | undefined) => {
          if (!old) return old;
          const next: IotDevicesGrouped = {};
          for (const key of Object.keys(old)) {
            const entry = old[key];
            if (!entry) continue;
            next[key] = {
              ...entry,
              devices: entry.devices.map((d) =>
                d.id === updated.id ? { ...d, nickname: updated.nickname } : d,
              ),
            };
          }
          return next;
        },
      );
    },
  });

  return {
    grouped: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
    updateDeviceName: rename.mutateAsync,
    isUpdatingDeviceName: rename.isPending,
  };
}
