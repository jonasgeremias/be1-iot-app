import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { dashboardService } from '../services/dashboard.service';

/** Carousel highlights for the home screen. */
export function useHighlights() {
  return useQuery({
    queryKey: queryKeys.dashboard.highlights,
    queryFn: () => dashboardService.getHighlights(),
  });
}

/** Greeting + account summary for the home screen. */
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: () => dashboardService.getSummary(),
  });
}
