import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { supportService } from '../services/support.service';

/** Support contact details. */
export function useSupportInfo() {
  return useQuery({
    queryKey: queryKeys.support.info,
    queryFn: () => supportService.getInfo(),
  });
}
