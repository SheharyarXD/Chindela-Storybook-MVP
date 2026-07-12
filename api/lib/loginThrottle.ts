// In-memory, single-process attempt throttle for login endpoints (parent password
// login, child PIN login). This is intentionally not the same mechanism as the
// global per-IP rate limiter in security.ts: it's scoped per-identifier (per
// childId/per-email) so a 4-digit child PIN or a guessed password can't be brute
// forced just by staying under the global request budget.
//
// Limitation: state lives in a process-local Map. It resets on restart and is not
// shared across instances. Acceptable for this app's single-instance deployment;
// must move to a shared store (Redis/DB) before running multiple instances.

type Attempt = { failures: number; lockedUntil: number };

const FREE_ATTEMPTS = 5;
const BASE_LOCKOUT_SECONDS = 30;
const MAX_LOCKOUT_SECONDS = 15 * 60;

export function createThrottleStore() {
  return new Map<string, Attempt>();
}

export function checkAndRecordAttempt(
  key: string,
  store: Map<string, Attempt>,
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (entry && entry.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  return { allowed: true };
}

export function recordFailure(key: string, store: Map<string, Attempt>) {
  const now = Date.now();
  const entry = store.get(key) ?? { failures: 0, lockedUntil: 0 };
  entry.failures += 1;
  if (entry.failures > FREE_ATTEMPTS) {
    const lockoutSeconds = Math.min(BASE_LOCKOUT_SECONDS * 2 ** (entry.failures - FREE_ATTEMPTS - 1), MAX_LOCKOUT_SECONDS);
    entry.lockedUntil = now + lockoutSeconds * 1000;
  }
  store.set(key, entry);
}

export function resetAttempts(key: string, store: Map<string, Attempt>) {
  store.delete(key);
}
