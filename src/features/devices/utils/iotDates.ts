/**
 * Native (no moment/dayjs) pt-BR date helpers for the IoT screens. Mirrors the
 * specific be1-app formats used by the reading bar, charts and range labels.
 */

const pad2 = (n: number) => String(n).padStart(2, '0');

const MONTHS_PT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

const toDate = (d: Date | string): Date =>
  typeof d === 'string' ? new Date(d) : d;

/** "14:05" (HH:mm, padded). */
export const fmtHourColonMin = (d: Date | string): string => {
  const dt = toDate(d);
  return `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
};

/** "14h05" — be1-app "H'h'mm" (hour unpadded). */
export const fmtHourLitMin = (d: Date | string): string => {
  const dt = toDate(d);
  return `${dt.getHours()}h${pad2(dt.getMinutes())}`;
};

/** "D10-14h" — be1-app "'D'dd-H'h'". */
export const fmtDayHourLit = (d: Date | string): string => {
  const dt = toDate(d);
  return `D${pad2(dt.getDate())}-${dt.getHours()}h`;
};

/** "10/06". */
export const fmtDayMonth = (d: Date | string): string => {
  const dt = toDate(d);
  return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}`;
};

/** "10/06 14h" — be1-app "dd/MM HH'h'". */
export const fmtDayMonthHourLit = (d: Date | string): string => {
  const dt = toDate(d);
  return `${fmtDayMonth(dt)} ${pad2(dt.getHours())}h`;
};

/** "10/06 14h05" — be1-app "dd/MM HH'h'mm". */
export const fmtDayMonthHourMin = (d: Date | string): string => {
  const dt = toDate(d);
  return `${fmtDayMonth(dt)} ${pad2(dt.getHours())}h${pad2(dt.getMinutes())}`;
};

/** Minutes elapsed since `date` (null-safe). */
export function minutesSince(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / 60_000);
}

/**
 * Last-reading label — relative within the current year, full pt-BR date for
 * older readings (be1-app formatIotReadingDate).
 */
export function formatIotReadingDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = toDate(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();

  if (!sameYear) {
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }

  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const today = startOfDay(now);
  const target = startOfDay(d);
  const dayMs = 86_400_000;

  const time = `${d.getHours()}:${pad2(d.getMinutes())}`;

  if (target === today) return time;
  if (target === today - dayMs) return `Ontem às ${time}`;
  return `${pad2(d.getDate())}/${MONTHS_PT[d.getMonth()]} ${time}`;
}
