import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    note: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "n1", ...data })),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
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

import { GET, POST, PUT } from "@/app/api/notes/route";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { verifyToken } from "@/lib/csrf";
import { mockRequest, mockCsrfRequest } from "./helpers";

const clinician = { id: "c1", name: "Dr. C", email: "c@test.com", role: "clinician" };
const patient = { id: "p1", name: "Patient", email: "p@test.com", role: "patient" };

describe("GET /api/notes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns notes for clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(prisma.note.findMany).mockResolvedValue([{ id: "n1", content: "test" }] as any);
    const req = mockRequest({ cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("returns notes for patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.note.findMany).mockResolvedValue([]);
    const req = mockRequest({ cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("filters by patientId and type", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(prisma.note.findMany).mockResolvedValue([]);
    const req = mockRequest({ url: "http://localhost:3004/api/notes?patientId=p1&type=session", cookies: { session: "token" } });
    await GET(req);
    expect(prisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ patientId: "p1", type: "session" }) }),
    );
  });

  it("returns 403 when patient tries to filter by another patientId", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.note.findMany).mockResolvedValue([]);
    const req = mockRequest({ url: "http://localhost:3004/api/notes?patientId=other", cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(403);
    expect(prisma.note.findMany).not.toHaveBeenCalled();
  });

  it("scopes patient role to own notes when no patientId param", async () => {
    const ownPatient = { id: "p2", name: "Own Patient", email: "p2@test.com", role: "patient" };
    vi.mocked(requireAuth).mockResolvedValue(ownPatient as any);
    vi.mocked(prisma.note.findMany).mockResolvedValue([]);
    const req = mockRequest({ cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(prisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ patientId: "p2" }) }),
    );
  });

  it("narrows clinician scope with patientId param", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(prisma.note.findMany).mockResolvedValue([]);
    const req = mockRequest({ url: "http://localhost:3004/api/notes?patientId=p1", cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const where = vi.mocked(prisma.note.findMany).mock.calls[0]![0]!.where;
    expect(where).toMatchObject({ clinicianId: "c1", patientId: "p1" });
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue(true);
  });

  it("creates a note as clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/notes",
      body: { patientId: "p1", type: "session", content: "Session notes here" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 for missing fields", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/notes",
      body: { patientId: "p1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 403 without CSRF token", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(verifyToken).mockResolvedValue(false);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/notes",
      body: { patientId: "p1", type: "session", content: "notes" },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 401 for patient (CSRF passes, auth fails)", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/notes",
      body: { patientId: "p1", type: "session", content: "notes" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue(true);
  });

  it("updates a note as clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    const req = mockCsrfRequest({
      method: "PUT",
      url: "http://localhost:3004/api/notes",
      body: { id: "n1", content: "Updated content" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
  });

  it("returns 400 for missing fields", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    const req = mockCsrfRequest({
      method: "PUT",
      url: "http://localhost:3004/api/notes",
      body: { id: "n1" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("returns 403 without CSRF token", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(verifyToken).mockResolvedValue(false);
    const req = mockRequest({
      method: "PUT",
      url: "http://localhost:3004/api/notes",
      body: { id: "n1", content: "Updated" },
      cookies: { session: "token" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(403);
  });

  it("returns 401 for patient (CSRF passes, auth fails)", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockCsrfRequest({
      method: "PUT",
      url: "http://localhost:3004/api/notes",
      body: { id: "n1", content: "Updated" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });
});
