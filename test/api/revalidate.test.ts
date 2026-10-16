import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { POST } from "@/app/api/revalidate/route";
import { mockRequest } from "./helpers";

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REVALIDATION_SECRET = "test-secret";
  });

  it("revalidates with valid secret", async () => {
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/revalidate",
      body: { secret: "test-secret", commits: [{ added: ["content/team.json"], modified: [] }] },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.revalidated).toBe(true);
    expect(json.paths).toContain("/");
    expect(json.paths).toContain("/team");
  });

  it("returns 401 for invalid secret", async () => {
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/revalidate",
      body: { secret: "wrong" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 for missing secret", async () => {
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/revalidate",
      body: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when secret length differs from configured secret (no 500)", async () => {
    process.env.REVALIDATION_SECRET = "a".repeat(32);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/revalidate",
      body: { secret: "x" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when commits.added is not an array", async () => {
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/revalidate",
      body: {
        secret: "test-secret",
        commits: [{ added: "content/team.json", modified: [] }],
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid request");
  });

  it("always includes root path", async () => {
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/revalidate",
      body: { secret: "test-secret" },
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.paths).toContain("/");
  });
});
