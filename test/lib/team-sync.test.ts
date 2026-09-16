import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs", async (importOriginal) => {
  const orig = await importOriginal<typeof import("fs")>();
  const mockReadFile = vi.fn().mockReturnValue(JSON.stringify([
    { name: "Dr. Test Clinician", role: "Therapist", image: "/img.jpg", bio: "Test bio" },
    { name: "Dr. Unlinked", role: "Counselor", image: "/img2.jpg" },
  ]));
  return { ...orig, readFileSync: mockReadFile, default: { ...orig, readFileSync: mockReadFile } };
});

vi.mock("path", async (importOriginal) => {
  const orig = await importOriginal<typeof import("path")>();
  return { ...orig, join: (...args: string[]) => args.join("/") };
});

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findMany: vi.fn().mockResolvedValue([
        { id: "c1", name: "Dr. Test Clinician", email: "test@test.com" },
      ]),
    },
  },
}));

import { getTeamData, getMergedTeamData } from "@/lib/team-sync";
import * as fs from "fs";

describe("team-sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify([
      { name: "Dr. Test Clinician", role: "Therapist", image: "/img.jpg", bio: "Test bio" },
      { name: "Dr. Unlinked", role: "Counselor", image: "/img2.jpg" },
    ]));
  });

  it("getTeamData returns parsed CMS members", () => {
    const team = getTeamData();
    expect(team).toHaveLength(2);
    expect(team[0].name).toBe("Dr. Test Clinician");
  });

  it("getTeamData returns empty array on error", () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error("no"); });
    const team = getTeamData();
    expect(team).toEqual([]);
  });

  it("getMergedTeamData merges CMS with clinician DB data", async () => {
    const merged = await getMergedTeamData();
    expect(merged).toHaveLength(2);
    expect(merged[0].hasAccount).toBe(true);
    expect(merged[0].clinicianId).toBe("c1");
    expect(merged[1].hasAccount).toBe(false);
    expect(merged[1].clinicianId).toBeNull();
  });
});
