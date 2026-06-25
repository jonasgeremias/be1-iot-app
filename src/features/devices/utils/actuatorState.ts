import type { ChamberSnapshot } from '../schemas/device.schema';

/**
 * Atuadores da caixa de comando (PC-Agrícola) do SCC — portado do painel COMANDO
 * do firmware `be1-bananapi` (`src/gui/components/comando.rs`).
 *
 * São 16 atuadores: **AR QUENTE** (índices 1..8) e **AR RETORNO** (9..16). O estado
 * de cada um é um código 0..6 que vem da API por câmara
 * (`chamberSnapshot.hotAirActuatorState` / `returnAirActuatorState`) — a leitura já
 * existe em `GET /iot/device/data/latest`. O mapeamento espelha o `render()` do
 * firmware, que lê `hot_air[8]` / `return_air[8]`:
 *
 * - AR QUENTE `n` (1..8)  → câmara `n` · `hotAirActuatorState`
 * - AR RETORNO `n` (9..16) → câmara `n-8` · `returnAirActuatorState`
 */

/** Modo visual de um LED (verde ou vermelho). */
export type LedMode = 'off' | 'on' | 'blink' | 'slow';

export type ActuatorRow = 'hot' | 'return';

export interface ActuatorCell {
  /** Índice de fio 1..16 (1..8 = AR QUENTE, 9..16 = AR RETORNO). */
  index: number;
  row: ActuatorRow;
  /** Código bruto do estado 0..6. */
  code: number;
  green: LedMode;
  red: LedMode;
}

export interface ActuatorsState {
  /** Controlador presente — derivado de "existe snapshot SCC fresco". */
  link: boolean;
  /** 16 células em ordem: AR QUENTE 1..8, depois AR RETORNO 9..16. */
  cells: ActuatorCell[];
}

/**
 * Payload de comando aceito pelo backend/hardware. Fonte única: o schema Zod em
 * `device.schema.ts` (validável); re-exportado aqui por conveniência.
 */
export type { ActuatorCommand } from '../schemas/device.schema';

/** Cores fixas dos LEDs/cadeado — equipamento, não tema (igual a `comando.rs`). */
export const ACTUATOR_COLORS = {
  green: '#28A05A',
  red: '#ED3237',
  lock: '#EE1111',
  lockIcon: '#FFE100',
} as const;

// Códigos de estado (mirror de `ActuatorState` no firmware).
const ST_CLOSED = 1;
const ST_OPENING = 2;
const ST_OPEN = 3;
const ST_CLOSING = 4;
const ST_UNDEF_OPENING = 5;
const ST_UNDEF_CLOSING = 6;

const STATE_LABELS: Record<number, string> = {
  0: 'Indisponível',
  [ST_CLOSED]: 'Fechado',
  [ST_OPENING]: 'Abrindo',
  [ST_OPEN]: 'Aberto',
  [ST_CLOSING]: 'Fechando',
  [ST_UNDEF_OPENING]: 'Abrindo',
  [ST_UNDEF_CLOSING]: 'Fechando',
};

export function actuatorStateLabel(code: number): string {
  return STATE_LABELS[code] ?? 'Indisponível';
}

/** Mapeia um código de estado para o comportamento dos LEDs (verde, vermelho). */
export function ledModes(code: number): { green: LedMode; red: LedMode } {
  switch (code) {
    case ST_CLOSED:
      return { green: 'on', red: 'off' };
    case ST_OPENING:
      return { green: 'off', red: 'blink' };
    case ST_OPEN:
      return { green: 'off', red: 'on' };
    case ST_CLOSING:
      return { green: 'blink', red: 'off' };
    case ST_UNDEF_OPENING:
      return { green: 'off', red: 'slow' };
    case ST_UNDEF_CLOSING:
      return { green: 'slow', red: 'off' };
    default:
      return { green: 'off', red: 'off' };
  }
}

function normalizeCode(value: number | null | undefined): number {
  return typeof value === 'number' && value >= 0 && value <= 6 ? value : 0;
}

/** Constrói os 16 atuadores a partir das câmaras do latest data do SCC. */
export function mapChambersToActuators(
  chambers: Record<string, ChamberSnapshot> | null | undefined,
): ActuatorsState {
  const hot: ActuatorCell[] = [];
  const ret: ActuatorCell[] = [];
  let link = false;

  for (let n = 1; n <= 8; n++) {
    const chamber = chambers?.[String(n)];
    if (
      chamber &&
      (chamber.hotAirActuatorState != null || chamber.returnAirActuatorState != null)
    ) {
      link = true;
    }
    const hotCode = normalizeCode(chamber?.hotAirActuatorState);
    const retCode = normalizeCode(chamber?.returnAirActuatorState);
    hot.push({ index: n, row: 'hot', code: hotCode, ...ledModes(hotCode) });
    ret.push({ index: n + 8, row: 'return', code: retCode, ...ledModes(retCode) });
  }

  return { link, cells: [...hot, ...ret] };
}
