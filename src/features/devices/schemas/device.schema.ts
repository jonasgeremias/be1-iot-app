import { z } from 'zod';

/**
 * Device data contracts — ported 1:1 from the functional be1-app IoT DTOs
 * (`src/dtos/IIot*`). The real backend (GET /iot/devices/grouped,
 * /iot/device/data/latest, /iot/device/data) returns these shapes.
 *
 * Schemas are intentionally lenient (nullish/optional) so a minor backend
 * quirk degrades gracefully instead of bricking a screen — the service wraps
 * parsing in safeParse + logger fallback.
 */

// ── device entity ────────────────────────────────────────────────────────────
export const iotDeviceStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);
export type IotDeviceStatus = z.infer<typeof iotDeviceStatusSchema>;

export const iotDeviceTypeSchema = z.enum(['SCC', 'GRANO', 'PP', 'BULK']);
export type IotDeviceType = z.infer<typeof iotDeviceTypeSchema>;

export const iotDeviceSchema = z.object({
  id: z.string(),
  userId: z.string().optional().default(''),
  productId: z.string().optional(),
  orderNumber: z.string().optional().default(''),
  macAddress: z.string(),
  deviceType: iotDeviceTypeSchema,
  nickname: z.string().nullish(),
  status: iotDeviceStatusSchema,
  deviceGroupId: z.string().optional(),
  createdAt: z.string().optional().default(''),
});
export type IotDevice = z.infer<typeof iotDeviceSchema>;

export const iotDeviceGroupSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    responsible: z.string().optional().default(''),
    observation: z.string().optional(),
    userId: z.string().optional().default(''),
  })
  .nullable();
export type IotDeviceGroup = z.infer<typeof iotDeviceGroupSchema>;

export const iotGroupedEntrySchema = z.object({
  group: iotDeviceGroupSchema,
  devices: z.array(iotDeviceSchema),
});
/** Explicit (z.infer degrades to `unknown` for this nested record). */
export type IotGroupedEntry = { group: IotDeviceGroup; devices: IotDevice[] };

/** Record keyed by groupId or the literal "ungrouped". */
export const iotDevicesGroupedSchema = z.record(iotGroupedEntrySchema);
export type IotDevicesGrouped = Record<string, IotGroupedEntry>;

// ── latest data (GET /iot/device/data/latest) ────────────────────────────────
export const sccArrowSchema = z.object({
  kind: z.enum(['hot', 'return', 'flow']),
  direction: z.enum(['up', 'down', 'left', 'right']),
  partial: z.boolean(),
});
export type SccArrow = z.infer<typeof sccArrowSchema>;

/** One SCC chamber. Key is the index ('1'-'8'); '9' = return/furnace. */
export const chamberSnapshotSchema = z.object({
  time: z.string(),
  serverTime: z.string().optional(),
  temperature: z.number().nullable(),
  humidity: z.number().nullable(),
  hotAirActuatorState: z.number().nullable(),
  returnAirActuatorState: z.number().nullable(),
  arrows: z.array(sccArrowSchema).optional(),
});
export type ChamberSnapshot = z.infer<typeof chamberSnapshotSchema>;

/** CB200 snapshot — used by PP / BULK and as the SCC sub-card. */
export const cb200SnapshotSchema = z.object({
  time: z.string(),
  serverTime: z.string().optional(),
  temperature: z.number(),
  humidity: z.number(),
  blower: z.boolean(),
  celsius: z.boolean().optional(),
  phase: z.number(),
  climate: z.number(),
  stTemperature: z.number(),
  stHumidity: z.number(),
});
export type Cb200Snapshot = z.infer<typeof cb200SnapshotSchema>;

/** Device-level snapshot — carries the alarm bitmask (u16). */
export const sccDeviceSnapshotSchema = z.object({
  time: z.string(),
  serverTime: z.string().optional(),
  alarmsFlags: z.number(),
});
export type SccDeviceSnapshot = z.infer<typeof sccDeviceSnapshotSchema>;

export const latestDataSchema = z.discriminatedUnion('deviceType', [
  z.object({
    deviceType: z.literal('SCC'),
    data: z.record(z.string(), chamberSnapshotSchema),
    cb200Data: cb200SnapshotSchema.nullish(),
    deviceSnapshot: sccDeviceSnapshotSchema.nullish(),
  }),
  z.object({
    deviceType: z.literal('PP'),
    data: cb200SnapshotSchema.nullable(),
    deviceSnapshot: sccDeviceSnapshotSchema.nullish(),
  }),
  z.object({
    deviceType: z.literal('BULK'),
    data: cb200SnapshotSchema.nullable(),
    deviceSnapshot: sccDeviceSnapshotSchema.nullish(),
  }),
  z.object({
    deviceType: z.literal('GRANO'),
    data: z.record(z.string(), z.unknown()).nullable(),
  }),
]);
export type LatestData = z.infer<typeof latestDataSchema>;

// ── SCC history (GET /iot/device/data → { data: Record<chamber, points> }) ────
export const historyPointSchema = z.object({
  time: z.string(),
  temperature: z.number(),
  humidity: z.number(),
});
export type HistoryPoint = z.infer<typeof historyPointSchema>;

export const deviceHistorySchema = z.record(
  z.string(),
  z.array(historyPointSchema),
);
export type DeviceHistory = z.infer<typeof deviceHistorySchema>;

// ── PP/BULK history (GET /iot/device/data) ───────────────────────────────────
export const cb200ResolutionSchema = z.enum([
  'raw',
  '10min',
  '15min',
  '20min',
  '1h',
]);
export type Cb200Resolution = z.infer<typeof cb200ResolutionSchema>;

export const cb200DataPointSchema = z.object({
  time: z.string(),
  serverTime: z.string().optional(),
  temperature: z.number(),
  stTemperature: z.number(),
  humidity: z.number(),
  stHumidity: z.number(),
  blower: z.boolean(),
  phase: z.number(),
  climate: z.number(),
});
export type Cb200DataPoint = {
  time: string;
  serverTime?: string;
  temperature: number;
  stTemperature: number;
  humidity: number;
  stHumidity: number;
  blower: boolean;
  phase: number;
  climate: number;
};

export const bulkHistoryResponseSchema = z.object({
  deviceType: z.enum(['PP', 'BULK']),
  resolution: cb200ResolutionSchema,
  first: z.string().nullable(),
  last: z.string().nullable(),
  count: z.number(),
  data: z.array(cb200DataPointSchema),
});
export type BulkHistoryResponse = {
  deviceType: 'PP' | 'BULK';
  resolution: Cb200Resolution;
  first: string | null;
  last: string | null;
  count: number;
  data: Cb200DataPoint[];
};

// ── device configuration (Configuração tab — kept on mock, no IoT endpoint) ──
/** online / offline / alert — used only by the (mock) config screen. */
export const deviceStatusSchema = z.enum(['online', 'offline', 'alert']);
export type DeviceStatus = z.infer<typeof deviceStatusSchema>;

export const deviceConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  model: z.string(),
  mac: z.string(),
  status: deviceStatusSchema,
  tempTarget: z.number(),
  tempMin: z.number(),
  tempMax: z.number(),
  humidityTarget: z.number(),
  humidityMin: z.number(),
  humidityMax: z.number(),
  blowerAuto: z.boolean(),
  readingInterval: z.string(),
  dryingPhase: z.string(),
  wifi: z.string(),
  ip: z.string(),
});
export type DeviceConfig = z.infer<typeof deviceConfigSchema>;
