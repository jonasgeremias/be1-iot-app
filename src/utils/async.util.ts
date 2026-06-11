/** Resolves after `ms` — used by mock services to simulate network latency. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
