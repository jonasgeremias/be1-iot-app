import { fmtDayHourLit, fmtHourLitMin } from './iotDates';

/**
 * History time-range presets, ported from be1-app. Uses native Date math
 * (offset = how many periods back from "now").
 */
export type TimeRangePresetOptions = '30min' | '1h' | '3h' | '6h' | '1day' | '7days' | '15days';

export type TimeRangePreset = {
  label: string;
  /** x-axis tick label for a point's timestamp. */
  formatTick: (d: Date) => string;
  getStart: (offset?: number) => Date | null;
  getEnd: (offset?: number) => Date | null;
};

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function relativePreset(
  label: string,
  spanMs: number,
  formatTick: (d: Date) => string,
): TimeRangePreset {
  return {
    label,
    formatTick,
    getEnd: (offset = 0) => (offset === 0 ? null : new Date(Date.now() - offset * spanMs)),
    getStart: (offset = 0) => new Date(Date.now() - (offset + 1) * spanMs),
  };
}

export const timeRangePresets: {
  [key in TimeRangePresetOptions]: TimeRangePreset;
} = {
  '30min': relativePreset('30 minutos', 30 * MIN, fmtHourLitMin),
  '1h': relativePreset('1 hora', HOUR, fmtHourLitMin),
  '3h': relativePreset('3 horas', 3 * HOUR, fmtHourLitMin),
  '6h': relativePreset('6 horas', 6 * HOUR, fmtHourLitMin),
  '1day': relativePreset('1 dia', DAY, fmtHourLitMin),
  '7days': relativePreset('7 dias', 7 * DAY, fmtDayHourLit),
  '15days': relativePreset('15 dias', 14 * DAY, fmtDayHourLit),
};

export const TIME_RANGE_OPTIONS: {
  key: TimeRangePresetOptions;
  label: string;
}[] = [
  { key: '30min', label: '30 minutos' },
  { key: '1h', label: '1 hora' },
  { key: '3h', label: '3 horas' },
  { key: '6h', label: '6 horas' },
  { key: '1day', label: '1 dia' },
  { key: '7days', label: '7 dias' },
  { key: '15days', label: '15 dias' },
];
