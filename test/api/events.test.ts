import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/events", () => ({
  publishEvent: vi.fn().mockImplementation((type, data) => ({ type, data, timestamp: new Date().toISOString() })),
  subscribe: vi.fn().mockReturnValue(() => {}),
  getRecentEvents: vi.fn().mockReturnValue([]),
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

import { GET } from "@/app/api/events/route";
import { POST } from "@/app/api/events/push/route";
import { publishEvent, getRecentEvents, subscribe, type AppEvent } from "@/lib/events";
import { requireAuth } from "@/lib/auth";
import { mockRequest } from "./helpers";

describe("GET /api/events", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 401 for non-clinician role", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "p1", role: "patient" } as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns SSE stream with correct headers for clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "c1", role: "clinician" } as any);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.headers.get("Cache-Control")).toContain("no-cache");
  });

  it("sends recent events on connect", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "c1", role: "clinician" } as any);
    vi.mocked(getRecentEvents).mockReturnValue([
      { type: "booking", data: { name: "Test" }, timestamp: new Date().toISOString() },
    ]);
    const res = await GET();
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    const { value } = await reader.read();
    const text = decoder.decode(value);
    expect(text).toContain("data:");
    expect(text).toContain("booking");
    reader.cancel();
  });

  it("subscribes to new events and enqueues them", async () => {
    let capturedCallback: ((event: AppEvent) => void) | null = null;
    vi.mocked(subscribe).mockImplementation((cb: (event: AppEvent) => void) => {
      capturedCallback = cb;
      return () => {};
    });

    vi.mocked(requireAuth).mockResolvedValue({ id: "c1", role: "clinician" } as any);
    const res = await GET();
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    // Read initial data (empty since no recent events)
    await reader.read();

    // Simulate a new event being published
    capturedCallback!({ type: "notification", data: { msg: "hello" }, timestamp: new Date().toISOString() });

    const { value } = await reader.read();
    const text = decoder.decode(value);
    expect(text).toContain("notification");
    expect(text).toContain("hello");
    reader.cancel();
  });
});

describe("POST /api/events/push", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishes event as clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "c1", role: "clinician" } as any);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/events/push",
      body: { type: "booking", data: { name: "Test" } },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(publishEvent).toHaveBeenCalledWith("booking", { name: "Test" });
  });

  it("returns 400 for missing type or data", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "c1", role: "clinician" } as any);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/events/push",
      body: { type: "booking" },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/events/push",
      body: { type: "booking", data: { name: "Test" } },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
