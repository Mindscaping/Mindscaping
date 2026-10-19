import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-pw"),
  verifyPassword: vi.fn(),
  createToken: vi.fn().mockResolvedValue("mock-jwt"),
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/csrf", () => ({
  generateToken: vi.fn().mockResolvedValue("mock-csrf"),
  verifyToken: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import { GET as meGET } from "@/app/api/auth/me/route";
import { prisma } from "@/lib/db";
import { getSession, verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { mockRequest } from "./helpers";

const user = { id: "u1", email: "test@test.com", name: "Test", role: "patient", passwordHash: "hashed" };

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, retryAfterMs: 0 });
  });

  it("registers a patient successfully", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(user as any);
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/register", body: { email: "test@test.com", password: "password123", name: "Test", role: "patient" } });
    const res = await registerPOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.role).toBe("patient");
  });

  it("returns 400 for missing fields", async () => {
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/register", body: { email: "test@test.com" } });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid role", async () => {
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/register", body: { email: "a@b.com", password: "password123", name: "X", role: "admin" } });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for short password", async () => {
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/register", body: { email: "a@b.com", password: "short", name: "X", role: "patient" } });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
  });

  it("returns 403 for clinician registration", async () => {
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/register", body: { email: "a@b.com", password: "password123", name: "Dr X", role: "clinician" } });
    const res = await registerPOST(req);
    expect(res.status).toBe(403);
  });

  it("returns 409 for duplicate email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as any);
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/register", body: { email: "test@test.com", password: "password123", name: "Test", role: "patient" } });
    const res = await registerPOST(req);
    expect(res.status).toBe(409);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfterMs: 30000 });
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/register", body: { email: "a@b.com", password: "password123", name: "X", role: "patient" } });
    const res = await registerPOST(req);
    expect(res.status).toBe(429);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, retryAfterMs: 0 });
  });

  it("logs in successfully", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as any);
    vi.mocked(verifyPassword).mockResolvedValue(true as any);
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/login", body: { email: "test@test.com", password: "password123" } });
    const res = await loginPOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("returns 400 for missing email/password", async () => {
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/login", body: { email: "test@test.com" } });
    const res = await loginPOST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for wrong password", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as any);
    vi.mocked(verifyPassword).mockResolvedValue(false as any);
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/login", body: { email: "test@test.com", password: "wrong" } });
    const res = await loginPOST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 for unknown email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/login", body: { email: "no@no.com", password: "password123" } });
    const res = await loginPOST(req);
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfterMs: 30000 });
    const req = mockRequest({ method: "POST", url: "http://localhost:3004/api/auth/login", body: { email: "a@b.com", password: "password123" } });
    const res = await loginPOST(req);
    expect(res.status).toBe(429);
  });
});

describe("POST /api/auth/logout", () => {
  it("returns 200 and clears cookie", async () => {
    const res = await logoutPOST();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});

describe("GET /api/auth/me", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns user when logged in", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: "u1", email: "test@test.com", name: "Test", role: "patient" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", email: "test@test.com", name: "Test", role: "patient", phone: null, createdAt: new Date() } as any);
    const res = await meGET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user).toBeTruthy();
  });

  it("returns null user when not logged in", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res = await meGET();
    const json = await res.json();
    expect(json.user).toBeNull();
  });
});
