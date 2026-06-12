import type {
  Cb200Snapshot,
  ChamberSnapshot,
  LatestData,
  SccDeviceSnapshot,
} from '../schemas/device.schema';

/** Narrowing helpers over the discriminated latest-data union (be1-app §parity). */

export function getSccChambers(
  latest: LatestData | undefined,
): Record<string, ChamberSnapshot> | null {
  return latest?.deviceType === 'SCC' ? latest.data : null;
}

export function getCb200Snapshot(latest: LatestData | undefined): Cb200Snapshot | null {
  if (latest?.deviceType === 'PP' || latest?.deviceType === 'BULK') {
    return latest.data;
  }
  return null;
}

export function getSccCb200Data(latest: LatestData | undefined): Cb200Snapshot | null {
  return latest?.deviceType === 'SCC' ? (latest.cb200Data ?? null) : null;
}

export function getSccDeviceSnapshot(latest: LatestData | undefined): SccDeviceSnapshot | null {
  return latest?.deviceType === 'SCC' ? (latest.deviceSnapshot ?? null) : null;
}

/** Device-level snapshot (alarms) for any non-GRANO type. */
export function getDeviceSnapshot(latest: LatestData | undefined): SccDeviceSnapshot | null {
  if (
    latest?.deviceType === 'SCC' ||
    latest?.deviceType === 'PP' ||
    latest?.deviceType === 'BULK'
  ) {
    return latest.deviceSnapshot ?? null;
  }
  return null;
}

/** Most-recent reading timestamp, normalized across device types. */
export function getLatestReadingDate(latest: LatestData | undefined): Date | null {
  if (!latest) return null;

  const toDate = (t?: string | null): Date | null => {
    if (!t) return null;
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  };

  if (latest.deviceType === 'SCC') {
    return Object.values(latest.data).reduce<Date | null>((acc, chamber) => {
      const d = toDate(chamber?.serverTime ?? chamber?.time);
      return d && (!acc || d > acc) ? d : acc;
    }, null);
  }

  if (latest.deviceType === 'PP' || latest.deviceType === 'BULK') {
    return toDate(latest.data?.serverTime ?? latest.data?.time);
  }

  return null;
}
