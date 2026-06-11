import { delay } from '@/utils/async.util';

import {
  deviceReportSchema,
  type DeviceReport,
  type ReportPeriod,
} from '../schemas/report.schema';

const REPORT_FIXTURE = {
  deviceName: 'Teste de bancada 1',
  model: 'CB200',
  rangeLabel: '04/06/2026 — 11/06/2026',
  availability: 94,
  availabilityDelta: '+2%',
  uptimeLabel: '6d 14h',
  alarms: 12,
  alarmsDelta: '+5',
  avgTemp: 72,
  events: [
    { level: 'AVISO', code: 'alarm.high_variation', time: '10:42' },
    { level: 'CRÍTICO', code: 'serial.cb200.disconnected', time: '10:39' },
    { level: 'INFO', code: 'serial.pc_agricola.reconnected', time: '10:42' },
  ],
};

export const reportService = {
  async getDeviceReport(
    id: string,
    period: ReportPeriod,
  ): Promise<DeviceReport> {
    await delay(350);
    void id;
    void period;
    return deviceReportSchema.parse(REPORT_FIXTURE);
  },
};
