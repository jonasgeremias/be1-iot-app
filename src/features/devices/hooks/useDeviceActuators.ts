import { getSccChambers } from '../utils/latestData';
import { mapChambersToActuators, type ActuatorsState } from '../utils/actuatorState';
import { LATEST_CARD_POLL_MS, useIotLatestData } from './useIotLatestData';

/**
 * Estado ao vivo dos 16 atuadores do SCC, derivado do latest data (a mesma rota
 * `GET /iot/device/data/latest`, com polling). A leitura já existe — a Fase 1
 * (visual) só mapeia câmaras → atuadores (ver `actuatorState.ts`).
 */
export function useDeviceActuators(deviceId: string) {
  const { latestData, lastFetch, isLoading, isError, refetch, dataUpdatedAt } = useIotLatestData(
    deviceId,
    LATEST_CARD_POLL_MS,
  );

  const actuators: ActuatorsState = mapChambersToActuators(getSccChambers(latestData));

  return { actuators, lastFetch, isLoading, isError, refetch, dataUpdatedAt };
}
