/**
 * IoT permission keys — parity with be1-dashboard `lib/iot/iotPermissions`.
 * Returned by POST /sessions in `permissions: string[]`.
 */
export const IotPermissions = {
  /** Can view IoT devices. */
  viewDevices: 'iotDevices',
  /** Admin: can manage/configure devices (gates the Configuração tab). */
  admin: 'iotLinkDevices',
} as const;
