/** Misc cross-cutting constants. */
export const DEVICE_STATUS = {
  online: 'online',
  offline: 'offline',
  alert: 'alert',
} as const;

export type DeviceStatus = (typeof DEVICE_STATUS)[keyof typeof DEVICE_STATUS];
