import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/team-sync", () => ({
  getMergedTeamData: vi.fn().mockResolvedValue([{ name: "Dr. Test", role: "clinician" }]),
}));

import { GET } from "@/app/api/team/route";

describe("GET /api/team", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns merged team data", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.team).toHaveLength(1);
    expect(json.team[0].name).toBe("Dr. Test");
  });
});
