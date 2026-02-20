/**
 * Exponential backoff reconnection strategy.
 * 1s → 2s → 4s → 8s → 16s → 30s (max) with ±20% jitter.
 */

const MIN_DELAY = 1000;
const MAX_DELAY = 30_000;
const JITTER_FACTOR = 0.2;

export interface ReconnectState {
  attempt: number;
  nextDelayMs: number;
}

function addJitter(delay: number): number {
  const jitter = delay * JITTER_FACTOR;
  return delay + (Math.random() * 2 - 1) * jitter;
}

export function initialReconnectState(): ReconnectState {
  return { attempt: 0, nextDelayMs: MIN_DELAY };
}

export function nextReconnectDelay(state: ReconnectState): {
  delayMs: number;
  next: ReconnectState;
} {
  const baseDelay = Math.min(MIN_DELAY * Math.pow(2, state.attempt), MAX_DELAY);
  const delayMs = Math.round(addJitter(baseDelay));
  return {
    delayMs,
    next: {
      attempt: state.attempt + 1,
      nextDelayMs: Math.min(baseDelay * 2, MAX_DELAY),
    },
  };
}

export function resetReconnectState(): ReconnectState {
  return initialReconnectState();
}
