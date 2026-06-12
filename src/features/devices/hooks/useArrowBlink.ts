import { useEffect, useState } from 'react';

/**
 * Shared blink signal (~600ms) for partial SCC flow arrows. A single timer
 * drives all subscribers so the arrows blink in sync (be1-app useArrowBlink).
 */
let on = true;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(v: boolean) => void>();

function ensureTimer() {
  if (timer) return;
  timer = setInterval(() => {
    on = !on;
    listeners.forEach((l) => l(on));
  }, 600);
}

export function useArrowBlink(): boolean {
  const [value, setValue] = useState(on);
  useEffect(() => {
    listeners.add(setValue);
    ensureTimer();
    return () => {
      listeners.delete(setValue);
      if (listeners.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);
  return value;
}
