import { z } from 'zod';

/** A single logged event in the device history. */
export const reportEventSchema = z.object({
  level: z.enum(['AVISO', 'CRÍTICO', 'INFO']),
  code: z.string(),
  time: z.string(),
});
export type ReportEvent = z.infer<typeof reportEventSchema>;

/** Device history report for a date range (screen 07). */
export const deviceReportSchema = z.object({
  deviceName: z.string(),
  model: z.string(),
  rangeLabel: z.string(),
  availability: z.number(),
  availabilityDelta: z.string(),
  uptimeLabel: z.string(),
  alarms: z.number(),
  alarmsDelta: z.string(),
  avgTemp: z.number(),
  events: z.array(reportEventSchema),
});
export type DeviceReport = z.infer<typeof deviceReportSchema>;

export type ReportPeriod = 'hoje' | '7dias' | '30dias' | 'mes';
