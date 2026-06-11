import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '@/constants/queryKeys.constants';
import { useDebounce } from '@/hooks/useDebounce';

import type {
  DeviceGroup,
  DeviceListItem,
  DeviceStatus,
} from '../schemas/device.schema';
import { deviceService } from '../services/device.service';

export type DeviceFilter = 'all' | DeviceStatus;

/**
 * Device groups with client-side search + status filtering applied. Returns
 * tela-ready, filtered groups (empty groups dropped).
 */
export function useDevices(search: string, filter: DeviceFilter) {
  const query = useQuery({
    queryKey: queryKeys.devices.list(filter),
    queryFn: () => deviceService.getGroups(),
  });

  const debounced = useDebounce(search.trim().toLowerCase(), 250);

  const groups = useMemo<DeviceGroup[]>(() => {
    if (!query.data) return [];
    return query.data
      .map((group: DeviceGroup) => ({
        ...group,
        devices: group.devices.filter((d: DeviceListItem) => {
          const matchesText =
            !debounced ||
            d.name.toLowerCase().includes(debounced) ||
            d.mac.toLowerCase().includes(debounced);
          const matchesFilter = filter === 'all' || d.status === filter;
          return matchesText && matchesFilter;
        }),
      }))
      .filter((group: DeviceGroup) => group.devices.length > 0);
  }, [query.data, debounced, filter]);

  const totalShown = useMemo(
    () => groups.reduce((acc, g) => acc + g.devices.length, 0),
    [groups],
  );

  return { ...query, groups, totalShown };
}
