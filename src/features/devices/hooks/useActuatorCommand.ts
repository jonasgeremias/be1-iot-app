import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import type { ActuatorCommand } from '../schemas/device.schema';
import { deviceService } from '../services/device.service';

/**
 * Envia um comando de atuador via API e, no sucesso, invalida o `latest` do
 * dispositivo — o `useIotLatestData` re-busca e a tela reflete o estado real.
 * **Sem otimismo:** a UI só muda quando o latest chega (o hardware é
 * fire-and-forget; o estado autoritativo vem na telemetria seguinte).
 */
export function useActuatorCommand(deviceId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (command: ActuatorCommand) => deviceService.sendActuatorCommand(deviceId, command),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.latest(deviceId) }),
  });

  return {
    sendCommand: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    reset: mutation.reset,
  };
}
