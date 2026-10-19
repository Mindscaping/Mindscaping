import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));

let checkRateLimit: typeof import("@/lib/rate-limit").checkRateLimit;
let getClientIp: typeof import("@/lib/rate-limit").getClientIp;
let rateLimitStoreSize: typeof import("@/lib/rate-limit").rateLimitStoreSize;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  const mod = await import("@/lib/rate-limit");
  checkRateLimit = mod.checkRateLimit;
  getClientIp = mod.getClientIp;
  rateLimitStoreSize = mod.rateLimitStoreSize;
});

describe("checkRateLimit", () => {
  it("allows first call within window", () => {
    const result = checkRateLimit("key1", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it("allows subsequent calls within limit", () => {
    checkRateLimit("key2", 5, 60_000);
    checkRateLimit("key2", 5, 60_000);
    checkRateLimit("key2", 5, 60_000);
    const result = checkRateLimit("key2", 5, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("denies when exceeding max attempts", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("key3", 5, 60_000);
    const result = checkRateLimit("key3", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("key4", 5, 60_000);
    expect(checkRateLimit("key4", 5, 60_000).allowed).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(checkRateLimit("key4", 5, 60_000).allowed).toBe(true);
  });

  it("different keys are independent", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("keyA", 5, 60_000);
    expect(checkRateLimit("keyA", 5, 60_000).allowed).toBe(false);
    expect(checkRateLimit("keyB", 5, 60_000).allowed).toBe(true);
  });
});
