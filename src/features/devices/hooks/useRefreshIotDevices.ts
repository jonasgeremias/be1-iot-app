import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

/** Invalidates the grouped list and live snapshots used by monitoring cards. */
export function useRefreshIotDevices() {
  const queryClient = useQueryClient();

  return () => void queryClient.invalidateQueries({ queryKey: queryKeys.devices.all });
}
