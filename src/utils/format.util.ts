/** Small pure formatters used across telemetry displays. */

export function formatTemp(celsius: number): string {
  return `${Math.round(celsius)}°`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Formats an ISO timestamp as `HH:mm` (prototype shows e.g. "11:05"). */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--:--';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
