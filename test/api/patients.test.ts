import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

import { GET } from "@/app/api/patients/route";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const clinician = { id: "c1", name: "Dr. C", email: "c@test.com", role: "clinician" };
const patients = [
  { id: "p1", name: "Patient 1", email: "p1@test.com", phone: "9876543210", createdAt: new Date() },
];

describe("GET /api/patients", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns patients for clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(patients as any);
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.patients).toHaveLength(1);
  });

  it("returns 401 for patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
