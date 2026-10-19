import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    session: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "s1", ...data })),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

import { GET, POST } from "@/app/api/sessions/route";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { mockRequest } from "./helpers";

const clinician = { id: "c1", name: "Dr. C", email: "c@test.com", role: "clinician" };
const patient = { id: "p1", name: "Patient", email: "p@test.com", role: "patient" };

describe("GET /api/sessions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns sessions for clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(prisma.session.findMany).mockResolvedValue([{ id: "s1", clinicianId: "c1" }] as any);
    const req = mockRequest({ cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.sessions).toHaveLength(1);
  });

  it("returns sessions for patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.session.findMany).mockResolvedValue([{ id: "s2", patientId: "p1" }] as any);
    const req = mockRequest({ cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("filters by patientId for clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(prisma.session.findMany).mockResolvedValue([]);
    const req = mockRequest({ url: "http://localhost:3004/api/sessions?patientId=p1", cookies: { session: "token" } });
    await GET(req);
    expect(prisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ patientId: "p1" }) }),
    );
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/sessions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a session as clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/sessions",
      body: { patientId: "p1", date: "2026-12-01", type: "individual" },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 for missing fields", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/sessions",
      body: { patientId: "p1" },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/sessions",
      body: { patientId: "p1", date: "2026-12-01", type: "individual" },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
