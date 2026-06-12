import type { z } from 'zod';

import { apiClient } from '@/services/api/axios';
import { logger } from '@/services/logger/logger';

import {
  bulkHistoryResponseSchema,
  deviceConfigSchema,
  deviceHistorySchema,
  iotDeviceEventsResponseSchema,
  iotDeviceSchema,
  iotDeviceSettingsResponseSchema,
  iotDevicesGroupedSchema,
  latestDataSchema,
  type BulkHistoryResponse,
  type DeviceConfig,
  type DeviceHistory,
  type IotDevice,
  type IotDeviceEventsResponse,
  type IotDeviceSettingsResponse,
  type IotDevicesGrouped,
  type IotEventSeverity,
  type LatestData,
} from '../schemas/device.schema';

/** Filters for GET /iot/device/events. */
export type DeviceEventsParams = {
  device: string;
  start?: string;
  end?: string;
  severity?: IotEventSeverity[];
  page?: number;
  limit?: number;
};

/**
 * Real device IO over the be1-app IoT endpoints. Validation is resilient: a
 * schema mismatch logs a warning and falls back to the raw payload instead of
 * throwing, so a minor backend drift never bricks a screen.
 */
function parseOr<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
  scope: string,
): z.infer<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  logger.warn('device.service', `validation fallback: ${scope}`, {
    issues: result.error.issues.slice(0, 3),
  });
  return data as z.infer<S>;
}

export const deviceService = {
  /** GET /iot/devices/grouped — devices grouped by facility (+ "ungrouped"). */
  async getGroupedDevices(): Promise<IotDevicesGrouped> {
    const { data } = await apiClient.get('/iot/devices/grouped');
    return parseOr(iotDevicesGroupedSchema, data, 'grouped') as IotDevicesGrouped;
  },

  /** GET /iot/device/data/latest — real-time snapshot for a device. */
  async getLatestData(deviceId: string): Promise<LatestData> {
    const { data } = await apiClient.get('/iot/device/data/latest', {
      params: { device: deviceId },
    });
    return parseOr(latestDataSchema, data, 'latest');
  },

  /** GET /iot/device/data — SCC per-chamber history (response.data.data). */
  async getSccHistory(
    deviceId: string,
    start: string,
    end: string,
  ): Promise<DeviceHistory> {
    const { data } = await apiClient.get('/iot/device/data', {
      params: { device: deviceId, start, end },
    });
    return parseOr(deviceHistorySchema, data?.data ?? {}, 'sccHistory');
  },

  /** GET /iot/device/data — PP/BULK CB200 history (full response). */
  async getBulkHistory(
    deviceId: string,
    start: string,
    end: string,
  ): Promise<BulkHistoryResponse> {
    const { data } = await apiClient.get('/iot/device/data', {
      params: { device: deviceId, start, end },
    });
    return parseOr(bulkHistoryResponseSchema, data, 'bulkHistory') as BulkHistoryResponse;
  },

  /** GET /iot/device/events — paginated device events (SCC/PP/BULK). */
  async getDeviceEvents(
    params: DeviceEventsParams,
  ): Promise<IotDeviceEventsResponse> {
    const { data } = await apiClient.get('/iot/device/events', { params });
    return parseOr(
      iotDeviceEventsResponseSchema,
      data,
      'events',
    ) as IotDeviceEventsResponse;
  },

  /** GET /iot/device/settings — remote settings tree (admin). */
  async getDeviceSettings(
    deviceId: string,
    timeoutMs?: number,
  ): Promise<IotDeviceSettingsResponse> {
    const { data } = await apiClient.get('/iot/device/settings', {
      params: { deviceId, ...(timeoutMs != null ? { timeoutMs } : {}) },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    return parseOr(
      iotDeviceSettingsResponseSchema,
      data,
      'settings',
    ) as IotDeviceSettingsResponse;
  },

  /** PUT /iot/device/settings — apply a settings patch (admin). */
  async putDeviceSettings(payload: {
    deviceId: string;
    settings: Record<string, unknown>;
    hash: string;
    timeoutMs?: number;
  }): Promise<IotDeviceSettingsResponse> {
    const { data } = await apiClient.put('/iot/device/settings', payload);
    return parseOr(
      iotDeviceSettingsResponseSchema,
      data,
      'settings',
    ) as IotDeviceSettingsResponse;
  },

  /** PUT /iot/devices/:id — rename a device. */
  async updateDeviceName(id: string, nickname: string): Promise<IotDevice> {
    const { data } = await apiClient.put(`/iot/devices/${id}`, { nickname });
    return parseOr(iotDeviceSchema, data, 'updateName');
  },

  /**
   * Device configuration (Configuração tab). The IoT backend exposes no config
   * endpoint in scope, so this stays a local default keyed by device id.
   */
  async getDeviceConfig(id: string): Promise<DeviceConfig> {
    return deviceConfigSchema.parse({
      id,
      name: 'Dispositivo',
      model: 'SCC',
      mac: '—',
      status: 'offline',
      tempTarget: 80,
      tempMin: 0,
      tempMax: 150,
      humidityTarget: 70,
      humidityMin: 0,
      humidityMax: 100,
      blowerAuto: true,
      readingInterval: '30 min',
      dryingPhase: 'Amarelação',
      wifi: 'BE1‑Campo',
      ip: '192.168.0.42',
    });
  },
};
