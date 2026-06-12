import { useEffect, useState } from 'react';

/**
 * Seconds remaining until the next refetch, derived from react-query's
 * `dataUpdatedAt` and the polling interval (be1-app §2.1).
 */
export function useRefetchCountdown(intervalMs: number, dataUpdatedAt: number | undefined) {
  const compute = () => {
    if (!dataUpdatedAt) return Math.ceil(intervalMs / 1000);
    const elapsed = Date.now() - dataUpdatedAt;
    const left = Math.ceil((intervalMs - elapsed) / 1000);
    return Math.max(0, Math.min(Math.ceil(intervalMs / 1000), left));
  };

  const [secondsLeft, setSecondsLeft] = useState(compute);

  useEffect(() => {
    setSecondsLeft(compute());
    const id = setInterval(() => setSecondsLeft(compute()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, dataUpdatedAt]);

  const totalSeconds = Math.ceil(intervalMs / 1000);
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  return { secondsLeft, totalSeconds, progress };
}
