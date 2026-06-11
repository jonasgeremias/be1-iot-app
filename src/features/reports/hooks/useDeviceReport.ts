import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import type { ReportPeriod } from '../schemas/report.schema';
import { reportService } from '../services/report.service';

/** Device history report for the selected period. */
export function useDeviceReport(id: string, period: ReportPeriod) {
  return useQuery({
    queryKey: queryKeys.devices.history(id, period),
    queryFn: () => reportService.getDeviceReport(id, period),
    enabled: !!id,
  });
}
