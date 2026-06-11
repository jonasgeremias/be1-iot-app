/** Realtime event contract feeding the React Query cache (never a parallel store). */
export type DeviceReadingEvent = {
  deviceId: string;
  temperature: number;
  humidity: number;
  blowerOn: boolean;
  status: 'online' | 'offline' | 'alert';
  at: string; // ISO timestamp
};

export type RealtimeEventMap = {
  'device:reading': DeviceReadingEvent;
};

export type RealtimeEvent = keyof RealtimeEventMap;
