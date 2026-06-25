import { useMemo } from 'react';

import { getSccChambers } from '../utils/latestData';
import { mapChambersToActuators, type ActuatorsState } from '../utils/actuatorState';
import { LATEST_CARD_POLL_MS, useIotLatestData } from './useIotLatestData';

/**
 * Estado ao vivo dos 16 atuadores do SCC, derivado do latest data (a mesma rota
 * `GET /iot/device/data/latest`, com polling). A leitura já existe — só mapeia
 * câmaras → atuadores (ver `actuatorState.ts`).
 *
 * `actuators` é memoizado por `latestData` (estável entre polls): assim a seleção
 * de um botão não recria o array de células nem força re-render dos LEDs.
 */
export function useDeviceActuators(deviceId: string) {
  const { latestData, lastFetch, isLoading, isError, refetch, dataUpdatedAt } = useIotLatestData(
    deviceId,
    LATEST_CARD_POLL_MS,
  );

  const actuators: ActuatorsState = useMemo(
    () => mapChambersToActuators(getSccChambers(latestData)),
    [latestData],
  );

  return { actuators, lastFetch, isLoading, isError, refetch, dataUpdatedAt };
}
