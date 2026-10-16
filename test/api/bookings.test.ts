import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    booking: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "bk1", ...data, createdAt: new Date() })),
      update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/csrf", () => ({
  generateToken: vi.fn().mockResolvedValue("mock-csrf"),
  verifyToken: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/events", () => ({
  publishEvent: vi.fn(),
}));

vi.mock("@/lib/booking", () => ({
  saveBooking: vi.fn().mockImplementation((data) => Promise.resolve({ id: "bk1", ...data, createdAt: new Date() })),
  validateBooking: vi.fn().mockReturnValue({}),
}));

import { GET, POST, PATCH } from "@/app/api/bookings/route";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { verifyToken } from "@/lib/csrf";
import { publishEvent } from "@/lib/events";
import { validateBooking } from "@/lib/booking";
import { mockRequest, mockCsrfRequest } from "./helpers";

const clinician = { id: "c1", name: "Dr. C", email: "c@test.com", role: "clinician" };
const patient = { id: "p1", name: "Patient", email: "p@test.com", role: "patient" };

describe("GET /api/bookings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("patient sees own bookings", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.booking.findMany).mockResolvedValue([{ id: "b1", email: "p@test.com" }] as any);
    const req = mockRequest({ cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ email: "p@test.com" }) }),
    );
  });

  it("clinician sees all bookings", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(prisma.booking.findMany).mockResolvedValue([]);
    const req = mockRequest({ cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it("clinician filters by email query param", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(prisma.booking.findMany).mockResolvedValue([]);
    const req = mockRequest({ url: "http://localhost:3004/api/bookings?email=x@test.com", cookies: { session: "token" } });
    await GET(req);
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "x@test.com" } }),
    );
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue(true);
  });

  it("creates a booking", async () => {
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/bookings",
      body: { name: "Test", email: "t@t.com", phone: "9876543210", sessionType: "individual", preferredDate: "2026-12-01", preferredTime: "10:00" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(publishEvent).toHaveBeenCalled();
  });

  it("returns 400 for invalid booking", async () => {
    vi.mocked(validateBooking).mockReturnValue({ name: "Required" });
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/bookings",
      body: { name: "" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 403 without CSRF token", async () => {
    vi.mocked(verifyToken).mockResolvedValue(false);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/bookings",
      body: { name: "Test" },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue(true);
  });

  it("updates booking status as clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    const req = mockCsrfRequest({
      method: "PATCH",
      url: "http://localhost:3004/api/bookings",
      body: { id: "bk1", status: "confirmed" },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("returns 400 for missing id or status", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    const req = mockCsrfRequest({
      method: "PATCH",
      url: "http://localhost:3004/api/bookings",
      body: { id: "bk1" },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid status", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    const req = mockCsrfRequest({
      method: "PATCH",
      url: "http://localhost:3004/api/bookings",
      body: { id: "bk1", status: "invalid" },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockCsrfRequest({
      method: "PATCH",
      url: "http://localhost:3004/api/bookings",
      body: { id: "bk1", status: "confirmed" },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 without CSRF token", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(verifyToken).mockResolvedValue(false);
    const req = mockRequest({
      method: "PATCH",
      url: "http://localhost:3004/api/bookings",
      body: { id: "bk1", status: "confirmed" },
      cookies: { session: "token" },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(403);
  });
});
