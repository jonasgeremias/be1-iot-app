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
  temperature: z.number().nullable(),
  humidity: z.number().nullable(),
  blower: z.boolean().nullable(),
  celsius: z.boolean().optional(),
  phase: z.number().nullable(),
  climate: z.number().nullable(),
  stTemperature: z.number().nullable(),
  stHumidity: z.number().nullable(),
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
  serverTime: z.string().optional(),
  temperature: z.number().nullable(),
  humidity: z.number().nullable(),
  // SCC history carries the full snapshot — actuator states drive airflow order.
  hotAirActuatorState: z.number().nullish(),
  returnAirActuatorState: z.number().nullish(),
  arrows: z.array(sccArrowSchema).optional(),
});
export type HistoryPoint = {
  time: string;
  serverTime?: string;
  temperature: number | null;
  humidity: number | null;
  hotAirActuatorState?: number | null;
  returnAirActuatorState?: number | null;
  arrows?: SccArrow[];
};

export const deviceHistorySchema = z.record(z.string(), z.array(historyPointSchema));
export type DeviceHistory = z.infer<typeof deviceHistorySchema>;

// ── PP/BULK history (GET /iot/device/data) ───────────────────────────────────
export const cb200ResolutionSchema = z.enum(['raw', '10min', '15min', '20min', '1h']);
export type Cb200Resolution = z.infer<typeof cb200ResolutionSchema>;

export const cb200DataPointSchema = z.object({
  time: z.string(),
  serverTime: z.string().optional(),
  temperature: z.number().nullable(),
  stTemperature: z.number().nullable(),
  humidity: z.number().nullable(),
  stHumidity: z.number().nullable(),
  blower: z.boolean().nullable(),
  phase: z.number().nullable(),
  climate: z.number().nullable(),
});
export type Cb200DataPoint = {
  time: string;
  serverTime?: string;
  temperature: number | null;
  stTemperature: number | null;
  humidity: number | null;
  stHumidity: number | null;
  blower: boolean | null;
  phase: number | null;
  climate: number | null;
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

// ── device events (GET /iot/device/events) ───────────────────────────────────
export const iotEventSeveritySchema = z.enum(['I', 'W', 'E', 'C']);
export type IotEventSeverity = z.infer<typeof iotEventSeveritySchema>;

export const iotDeviceEventSchema = z.object({
  id: z.string(),
  deviceId: z.string().optional().default(''),
  timeEmitted: z.string(),
  // Kept raw (string/number) — normalized to I/W/E/C at display time.
  severity: z.union([z.string(), z.number()]).catch('I'),
  eventType: z.string(),
  metadata: z.unknown().optional(),
});
export type IotDeviceEvent = {
  id: string;
  deviceId: string;
  timeEmitted: string;
  severity: string | number;
  eventType: string;
  metadata?: unknown;
};

export const iotDeviceEventsResponseSchema = z.object({
  total: z.number().optional().default(0),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(25),
  data: z.array(iotDeviceEventSchema),
});
export type IotDeviceEventsResponse = {
  total: number;
  page: number;
  limit: number;
  data: IotDeviceEvent[];
};

// ── device settings tree (GET/PUT /iot/device/settings) ───────────────────────
export const iotDeviceSettingsResponseSchema = z.object({
  error: z.boolean().optional().default(false),
  message: z.string().optional().default(''),
  data: z.object({
    settings: z.record(z.string(), z.unknown()),
    hash: z.string(),
    applied: z.boolean().optional(),
    id: z.string().optional(),
    error: z.string().nullish(),
  }),
});
export type IotDeviceSettingsResponse = {
  error: boolean;
  message: string;
  data: {
    settings: Record<string, unknown>;
    hash: string;
    applied?: boolean;
    id?: string;
    error?: string | null;
  };
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
