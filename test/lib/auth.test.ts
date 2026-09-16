import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("jose", () => ({
  SignJWT: class {
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() { return "mock-token"; }
  },
  jwtVerify: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-pw"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));

import { hashPassword, verifyPassword, createToken, verifyToken, getSession, requireAuth, getUserFromDB } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

describe("auth lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hashPassword calls bcrypt.hash with 12 rounds", async () => {
    const result = await hashPassword("test");
    expect(result).toBe("hashed-pw");
    expect(bcrypt.hash).toHaveBeenCalledWith("test", 12);
  });

  it("verifyPassword calls bcrypt.compare", async () => {
    const result = await verifyPassword("pw", "hash");
    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith("pw", "hash");
  });

  it("createToken returns a JWT string", async () => {
    const token = await createToken({ id: "1", email: "test@test.com", name: "Test", role: "patient" });
    expect(token).toBe("mock-token");
  });

  it("verifyToken returns user on valid token", async () => {
    vi.mocked(jwtVerify).mockResolvedValue({ payload: { id: "1", role: "patient" } } as any);
    const user = await verifyToken("valid");
    expect(user).toEqual({ id: "1", role: "patient" });
  });

  it("verifyToken returns null on invalid token", async () => {
    vi.mocked(jwtVerify).mockRejectedValue(new Error("bad"));
    const user = await verifyToken("bad");
    expect(user).toBeNull();
  });

  it("getSession returns null when no cookie", async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => undefined } as any);
    const session = await getSession();
    expect(session).toBeNull();
  });

  it("getSession verifies token from cookie", async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: "tok" }) } as any);
    vi.mocked(jwtVerify).mockResolvedValue({ payload: { id: "1", role: "clinician" } } as any);
    const session = await getSession();
    expect(session).toEqual({ id: "1", role: "clinician" });
  });

  it("requireAuth returns null when not logged in", async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => undefined } as any);
    const result = await requireAuth();
    expect(result).toBeNull();
  });

  it("requireAuth returns null when role mismatch", async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: "tok" }) } as any);
    vi.mocked(jwtVerify).mockResolvedValue({ payload: { id: "1", role: "patient" } } as any);
    const result = await requireAuth("clinician");
    expect(result).toBeNull();
  });

  it("requireAuth returns user when role matches", async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: "tok" }) } as any);
    vi.mocked(jwtVerify).mockResolvedValue({ payload: { id: "1", role: "clinician" } } as any);
    const result = await requireAuth("clinician");
    expect(result).toEqual({ id: "1", role: "clinician" });
  });

  it("requireAuth returns user without role check", async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: "tok" }) } as any);
    vi.mocked(jwtVerify).mockResolvedValue({ payload: { id: "1", role: "patient" } } as any);
    const result = await requireAuth();
    expect(result).toEqual({ id: "1", role: "patient" });
  });

  it("getUserFromDB queries prisma for user", async () => {
    const mockUser = { id: "u1", email: "a@b.com", name: "Test" };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    const result = await getUserFromDB("a@b.com");
    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "a@b.com" } });
  });

  it("getUserFromDB returns null for unknown email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const result = await getUserFromDB("unknown@test.com");
    expect(result).toBeNull();
  });
});
