const store = new Map<string, { count: number; resetTime: number }>();

const MAX_ATTEMPTS = parseInt(process.env.RATE_LIMIT_MAX || "3", 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);

// Trusted client IP: X-Real-IP is set by nginx from $remote_addr; otherwise take
// the LAST X-Forwarded-For entry (proxies append the real client last), never the
// first — a client can spoof whatever comes before the appended entry.
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const realIp = req.headers.get("x-real-ip")?.split(",")[0]?.trim();
  if (realIp) return realIp;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const last = forwarded.split(",").pop()?.trim();
    if (last) return last;
  }
  return "unknown";
}

export function rateLimitStoreSize(): number {
  return store.size;
}

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
