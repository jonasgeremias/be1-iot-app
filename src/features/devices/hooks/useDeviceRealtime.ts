import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryKeys } from '@/constants/queryKeys.constants';
import { realtimeService } from '@/services/realtime/realtime.service';

import type { DeviceDetail } from '../schemas/device.schema';

/**
 * Subscribes to live device readings and writes them straight into the React
 * Query cache — never a parallel store (per the spec). No-op until a realtime
 * backend is connected, but wired correctly so it "just works" once it is.
 */
export function useDeviceRealtime(deviceId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!deviceId) return;
    realtimeService.connect();

    const off = realtimeService.on('device:reading', (reading) => {
      if (reading.deviceId !== deviceId) return;
      queryClient.setQueryData<DeviceDetail>(
        queryKeys.devices.detail(deviceId),
        (prev: DeviceDetail | undefined) =>
          prev
            ? {
                ...prev,
                status: reading.status,
                blowerOn: reading.blowerOn,
                temp: { ...prev.temp, value: reading.temperature },
                humidity: { ...prev.humidity, value: reading.humidity },
              }
            : prev,
      );
    });

    return () => {
      off();
    };
  }, [deviceId, queryClient]);
}
