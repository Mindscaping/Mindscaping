const store = new Map<string, { count: number; resetTime: number }>();

const MAX_ATTEMPTS = parseInt(process.env.RATE_LIMIT_MAX || "3", 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);

export function checkRateLimit(
  key: string,
  maxAttempts: number = MAX_ATTEMPTS,
  windowMs: number = WINDOW_MS
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}
