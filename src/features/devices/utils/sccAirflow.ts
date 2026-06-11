// Airflow ordering of the 8 SCC chambers (be1-app iot-scc-variacao-temperatura).
// An actuator is "active" when it reads 2 (OPENNING) or 3 (OPEN).

const isActive = (v: number | null | undefined): boolean => v === 2 || v === 3;

/**
 * Airflow order of chambers (0-based) as [start, ...middle, end], or null when
 * there is no valid flow.
 */
export function firstAirflowChambers(
  hot: (number | null | undefined)[],
  ret: (number | null | undefined)[],
): number[] | null {
  const n = hot.length;

  let start = -1;
  for (let i = 0; i < n; i++) {
    if (isActive(hot[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  let middle: number[] = [];
  let idx = start;
  let safety = 0;

  while (safety++ < n * 4) {
    idx = (idx + 1) % n;
    if (idx === start) break;

    if (isActive(hot[idx])) {
      start = idx;
      middle = [];
      continue;
    }
    if (isActive(ret[idx])) {
      return [start, ...middle, idx];
    }
    middle.push(idx);
  }

  return null;
}

/** Resolved airflow order with a natural fallback [0..n-1]. */
export function airflowOrder(
  hot: (number | null | undefined)[],
  ret: (number | null | undefined)[],
): number[] {
  return firstAirflowChambers(hot, ret) ?? hot.map((_, i) => i);
}
