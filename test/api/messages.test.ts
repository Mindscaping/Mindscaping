import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    message: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "m1", ...data, createdAt: new Date() })),
      count: vi.fn().mockResolvedValue(0),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    user: {
      findUnique: vi.fn(),
    },
    session: {
      findFirst: vi.fn().mockResolvedValue(null),
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

import { GET, POST } from "@/app/api/messages/route";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { verifyToken } from "@/lib/csrf";
import { mockRequest, mockCsrfRequest } from "./helpers";

const user = { id: "u1", name: "User", email: "u@test.com", role: "patient" };

describe("GET /api/messages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns conversations list", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user as any);
    vi.mocked(prisma.message.findMany).mockResolvedValue([]);
    const req = mockRequest({ cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.conversations).toBeDefined();
  });

  it("returns specific conversation with 'with' param", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user as any);
    vi.mocked(prisma.message.findMany).mockResolvedValue([{ id: "m1", content: "hi" }] as any);
    const req = mockRequest({ url: "http://localhost:3004/api/messages?with=u2", cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(prisma.message.updateMany).toHaveBeenCalled();
  });

  it("builds conversation list with unread counts", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    // First findMany returns sent messages (receiverId), second returns received (senderId)
    vi.mocked(prisma.message.findMany)
      .mockResolvedValueOnce([{ receiverId: "u2" }] as any)
      .mockResolvedValueOnce([{ senderId: "u2" }] as any);

    vi.mocked(prisma.message.findFirst).mockResolvedValue({
      id: "m1",
      content: "last msg",
      createdAt: new Date().toISOString(),
      sender: { name: "Other" },
    } as any);
    vi.mocked(prisma.message.count).mockResolvedValue(2);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u2", name: "Other User", role: "clinician",
    } as any);

    const req = mockRequest({ cookies: { session: "token" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.conversations).toHaveLength(1);
    expect(json.conversations[0].otherUser.name).toBe("Other User");
    expect(json.conversations[0].unread).toBe(2);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue(true);
  });

  it("sends a message to a clinician with an existing care relationship", async () => {
    // Replaced: old version asserted patient→any-receiverId succeeds (vulnerable behavior)
    vi.mocked(requireAuth).mockResolvedValue(user as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "c1", role: "clinician" } as any);
    vi.mocked(prisma.session.findFirst).mockResolvedValue({ id: "s1" } as any);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/messages",
      body: { receiverId: "c1", content: "Hello!" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message).toBeDefined();
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: { senderId: "u1", receiverId: "c1", content: "Hello!" },
    });
  });

  it("returns 404 when receiver does not exist", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/messages",
      body: { receiverId: "ghost", content: "Hello!" },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it("returns 403 when a patient messages another patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u2", role: "patient" } as any);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/messages",
      body: { receiverId: "u2", content: "Hello!" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it("returns 403 when a patient messages a clinician with no care relationship", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "c1", role: "clinician" } as any);
    vi.mocked(prisma.session.findFirst).mockResolvedValue(null);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/messages",
      body: { receiverId: "c1", content: "Hello!" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it("allows a clinician to message a patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "c1", name: "Clin", email: "c@test.com", role: "clinician" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u2", role: "patient" } as any);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/messages",
      body: { receiverId: "u2", content: "Hi patient" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: { senderId: "c1", receiverId: "u2", content: "Hi patient" },
    });
  });

  it("returns 400 for self-messaging", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user as any);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/messages",
      body: { receiverId: "u1", content: "note to self" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it("returns 400 for missing fields", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user as any);
    const req = mockCsrfRequest({
      method: "POST",
      url: "http://localhost:3004/api/messages",
      body: { receiverId: "u2" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 403 without CSRF token", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user as any);
    vi.mocked(verifyToken).mockResolvedValue(false);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/messages",
      body: { receiverId: "u2", content: "Hello" },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});
