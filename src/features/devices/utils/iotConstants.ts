import { minutesSince } from './iotDates';
import type { IotDeviceStatus } from '../schemas/device.schema';

/** Whether a device matches the list search (nickname / MAC / order number). */
export function deviceMatchesSearch(
  device: { nickname?: string | null; macAddress: string; orderNumber?: string },
  query: string,
): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    !!device.nickname?.toLowerCase().includes(q) ||
    device.macAddress.toLowerCase().includes(q) ||
    (device.orderNumber ?? '').toLowerCase().includes(q)
  );
}

/** Normalize a MAC to AA:BB:CC:DD:EE:FF. */
export function formatMac(mac: string): string {
  const clean = mac.replace(/[^a-fA-F0-9]/g, '');
  return (
    clean
      .match(/.{1,2}/g)
      ?.join(':')
      .toUpperCase() ?? mac
  );
}

/** Device lifecycle status chip labels (IIotDevice.status). */
export const STATUS_LABELS: Record<
  IotDeviceStatus,
  { label: string; tone: 'online' | 'neutral' | 'red' }
> = {
  ACTIVE: { label: 'Ativo', tone: 'online' },
  INACTIVE: { label: 'Inativo', tone: 'neutral' },
  BLOCKED: { label: 'Bloqueado', tone: 'red' },
};

/** Safe status lookup — tolerates values outside the enum (backend drift). */
export function getStatusLabel(status: string): {
  label: string;
  tone: 'online' | 'neutral' | 'red';
} {
  return (
    STATUS_LABELS[status as IotDeviceStatus] ?? { label: status, tone: 'neutral' }
  );
}

// ── reading status (online / idle / offline) — be1-app §3 ─────────────────────
export type ReadingStatusKind = 'online' | 'idle' | 'offline';

export type ReadingStatus = {
  kind: ReadingStatusKind;
  label: string;
  /** Raw hex aligned to the light theme status tokens (used with alpha/SVG). */
  color: string;
};

const READING_COLORS = {
  online: '#16A66A',
  idle: '#E08A0B',
  offline: '#E04A3F',
} as const;

/**
 * Reading freshness from the age of the last reading AND requiring an ACTIVE
 * device. ≤5min → online, ≤15min → idle, else offline.
 */
export function getReadingStatus(
  lastReading: Date | null,
  deviceStatus: string | undefined,
): ReadingStatus {
  const mins = minutesSince(lastReading);

  if (deviceStatus !== 'ACTIVE' || mins === null || mins > 15) {
    return { kind: 'offline', label: 'Offline', color: READING_COLORS.offline };
  }
  if (mins <= 5) {
    return { kind: 'online', label: 'Online', color: READING_COLORS.online };
  }
  return { kind: 'idle', label: 'Ocioso', color: READING_COLORS.idle };
}

// ── CB200 bitmasks (PP/BULK) ──────────────────────────────────────────────────
/** Phase options, top-to-bottom (be1-app §2.6). */
export const CB200_PHASES = [
  { value: 0x40, label: 'Secagem do Talo' },
  { value: 0x20, label: 'Secagem da Lâmina' },
  { value: 0x10, label: 'Murchamento' },
  { value: 0x08, label: 'Amarelação' },
] as const;

export const CB200_CLIMATES = [
  { value: 0x04, label: 'Úmido', icon: 'grain' as const },
  { value: 0x02, label: 'Seco', icon: 'sun' as const },
  { value: 0x01, label: 'Normal', icon: 'cloud' as const },
] as const;
