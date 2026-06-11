import { z } from 'zod';

/** online / offline / alert. */
export const deviceStatusSchema = z.enum(['online', 'offline', 'alert']);
export type DeviceStatus = z.infer<typeof deviceStatusSchema>;

/** Color tone of a temperature cell in the device card's mini grid. */
export const cellToneSchema = z.enum(['online', 'amber', 'muted']);
export type CellTone = z.infer<typeof cellToneSchema>;

export const chamberSchema = z.object({
  value: z.number(),
  tone: cellToneSchema,
});
export type Chamber = z.infer<typeof chamberSchema>;

/** A device as shown in the list (screen 03). */
export const deviceListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: deviceStatusSchema,
  updatedLabel: z.string(),
  temp: z.number(),
  humidity: z.number(),
  blowerOn: z.boolean(),
  model: z.string(),
  active: z.boolean(),
  mac: z.string(),
  mainTemp: z.number(),
  mainTone: cellToneSchema,
  chambers: z.array(chamberSchema).length(8),
});
export type DeviceListItem = z.infer<typeof deviceListItemSchema>;

/** A named group of devices (e.g. "LABORATÓRIO"). */
export const deviceGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  total: z.number(),
  devices: z.array(deviceListItemSchema),
});
export type DeviceGroup = z.infer<typeof deviceGroupSchema>;

/** A temperature/humidity gauge on the detail screen. */
export const gaugeSchema = z.object({
  value: z.number(),
  target: z.number(),
  unit: z.string(),
  pct: z.number(),
  deltaLabel: z.string(),
  accent: z.enum(['amber', 'brand']),
});
export type Gauge = z.infer<typeof gaugeSchema>;

/** Real-time device detail (screen 04). */
export const deviceDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: deviceStatusSchema,
  model: z.string(),
  mac: z.string(),
  lastReadingLabel: z.string(),
  cycle: z.number(),
  temp: gaugeSchema,
  humidity: gaugeSchema,
  blowerOn: z.boolean(),
  chambers: z.array(z.number()).length(8),
  phase: z.object({
    current: z.string(),
    steps: z.array(z.string()),
  }),
  climate: z.object({
    current: z.string(),
    options: z.array(z.string()),
  }),
  hasAlarms: z.boolean(),
});
export type DeviceDetail = z.infer<typeof deviceDetailSchema>;
