import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ set: vi.fn() }),
}));

vi.mock("@/lib/db", () => ({ prisma: {} }));

import { generateToken, verifyToken } from "@/lib/csrf";
import { cookies } from "next/headers";
import { mockRequest } from "@/test/api/helpers";

describe("csrf lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateToken", () => {
    it("sets csrf_token cookie", async () => {
      await generateToken();
      const cookieStore = await cookies();
      expect(cookieStore.set).toHaveBeenCalledWith(
        "csrf_token",
        expect.any(String),
        expect.objectContaining({ httpOnly: false, path: "/" }),
      );
    });

    it("returns a 64-char hex string", async () => {
      const token = await generateToken();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("verifyToken", () => {
    it("returns true when header matches cookie", async () => {
      const req = mockRequest({
        cookies: { csrf_token: "abc123" },
        headers: { "x-csrf-token": "abc123" },
      });
      expect(await verifyToken(req)).toBe(true);
    });

    it("returns false when header is missing", async () => {
      const req = mockRequest({ cookies: { csrf_token: "abc123" } });
      expect(await verifyToken(req)).toBe(false);
    });

    it("returns false when cookie is missing", async () => {
      const req = mockRequest({ headers: { "x-csrf-token": "abc123" } });
      expect(await verifyToken(req)).toBe(false);
    });

    it("returns false when tokens mismatch", async () => {
      const req = mockRequest({
        cookies: { csrf_token: "aaa" },
        headers: { "x-csrf-token": "bbb" },
      });
      expect(await verifyToken(req)).toBe(false);
    });
  });
});
