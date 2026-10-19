import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    payment: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "pay1", ...data })),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    session: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/razorpay", () => ({
  createOrder: vi.fn().mockResolvedValue({ id: "order_123", amount: 50000, currency: "INR" }),
}));

import { GET, POST } from "@/app/api/payments/route";
import { POST as webhookPOST } from "@/app/api/payments/webhook/route";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createOrder } from "@/lib/razorpay";
import { mockRequest } from "./helpers";
import crypto from "crypto";

const patient = { id: "p1", name: "Patient", email: "p@test.com", role: "patient" };
const clinician = { id: "c1", name: "Dr. C", email: "c@test.com", role: "clinician" };

describe("POST /api/payments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a Razorpay order as patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.session.findUnique).mockResolvedValue({ id: "s1", patientId: "p1" } as any);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/payments",
      body: { sessionId: "s1", amount: 500000 },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.orderId).toBe("order_123");
  });

  it("returns 401 for clinician", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/payments",
      body: { sessionId: "s1", amount: 500000 },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("ignores client-supplied amount and uses server-side price", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.session.findUnique).mockResolvedValue({ id: "s1", patientId: "p1", type: "individual" } as any);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/payments",
      body: { sessionId: "s1", amount: 100 },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(createOrder).toHaveBeenCalledWith(50000, "s1");
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ amount: 50000 }),
    });
  });

  it("creates an order when client omits amount", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.session.findUnique).mockResolvedValue({ id: "s1", patientId: "p1", type: "individual" } as any);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/payments",
      body: { sessionId: "s1" },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(createOrder).toHaveBeenCalledWith(50000, "s1");
  });

  it("returns 400 for missing fields", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/payments",
      body: { amount: 100 },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 for session not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/payments",
      body: { sessionId: "s1", amount: 500000 },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 404 for session belonging to other patient", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.session.findUnique).mockResolvedValue({ id: "s1", patientId: "other" } as any);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/payments",
      body: { sessionId: "s1", amount: 500000 },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 409 for duplicate payment", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.session.findUnique).mockResolvedValue({ id: "s1", patientId: "p1" } as any);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({ id: "existing" } as any);
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/payments",
      body: { sessionId: "s1", amount: 500000 },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("returns 500 when Razorpay fails", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.session.findUnique).mockResolvedValue({ id: "s1", patientId: "p1" } as any);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);
    vi.mocked(createOrder).mockRejectedValue(new Error("Razorpay down"));
    const req = mockRequest({
      method: "POST",
      url: "http://localhost:3004/api/payments",
      body: { sessionId: "s1", amount: 500000 },
      cookies: { session: "token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

describe("GET /api/payments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("patient sees own payments", async () => {
    vi.mocked(requireAuth).mockResolvedValue(patient as any);
    vi.mocked(prisma.payment.findMany).mockResolvedValue([{ id: "pay1", patientId: "p1" }] as any);
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("clinician sees payments for their sessions", async () => {
    vi.mocked(requireAuth).mockResolvedValue(clinician as any);
    vi.mocked(prisma.payment.findMany).mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("POST /api/payments/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test";
  });

  function makeWebhookBody(event: string, payload: Record<string, unknown>) {
    return JSON.stringify({ event, payload: { payment: { entity: payload } } });
  }

  function signBody(body: string): string {
    return crypto.createHmac("sha256", "whsec_test").update(body).digest("hex");
  }

  it("updates payment on payment.captured when webhook amount matches stored amount", async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: "pay1",
      razorpayOrderId: "order_123",
      amount: 50000,
    } as any);
    const body = makeWebhookBody("payment.captured", { order_id: "order_123", id: "pay_abc", amount: 50000 });
    const req = new Request("http://localhost:3004/api/payments/webhook", {
      method: "POST",
      body,
      headers: { "x-razorpay-signature": signBody(body), "Content-Type": "application/json" },
    });
    const res = await webhookPOST(req as any);
    expect(res.status).toBe(200);
    expect(prisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "captured" }) }),
    );
  });

  it("fails payment when webhook amount does not match stored amount", async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: "pay1",
      razorpayOrderId: "order_123",
      amount: 50000,
    } as any);
    const body = makeWebhookBody("payment.captured", { order_id: "order_123", id: "pay_abc", amount: 100 });
    const req = new Request("http://localhost:3004/api/payments/webhook", {
      method: "POST",
      body,
      headers: { "x-razorpay-signature": signBody(body), "Content-Type": "application/json" },
    });
    const res = await webhookPOST(req as any);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(prisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "failed" }) }),
    );
    expect(prisma.payment.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "captured" }) }),
    );
  });

  it("updates payment on payment.failed", async () => {
    const body = makeWebhookBody("payment.failed", { order_id: "order_123", id: "pay_abc" });
    const req = new Request("http://localhost:3004/api/payments/webhook", {
      method: "POST",
      body,
      headers: { "x-razorpay-signature": signBody(body), "Content-Type": "application/json" },
    });
    const res = await webhookPOST(req as any);
    expect(res.status).toBe(200);
    expect(prisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "failed" }) }),
    );
  });

  it("returns 401 for invalid signature", async () => {
    const body = makeWebhookBody("payment.captured", { order_id: "order_123", id: "pay_abc" });
    const badSig = "a".repeat(64); // must be same length as HMAC hex digest
    const req = new Request("http://localhost:3004/api/payments/webhook", {
      method: "POST",
      body,
      headers: { "x-razorpay-signature": badSig, "Content-Type": "application/json" },
    });
    const res = await webhookPOST(req as any);
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong-length signature", async () => {
    const body = makeWebhookBody("payment.captured", { order_id: "order_123", id: "pay_abc", amount: 50000 });
    const req = new Request("http://localhost:3004/api/payments/webhook", {
      method: "POST",
      body,
      headers: { "x-razorpay-signature": "a".repeat(10), "Content-Type": "application/json" },
    });
    const res = await webhookPOST(req as any);
    expect(res.status).toBe(401);
  });

  it("returns 500 when webhook secret is missing", async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const req = new Request("http://localhost:3004/api/payments/webhook", {
      method: "POST",
      body: "{}",
      headers: { "Content-Type": "application/json" },
    });
    const res = await webhookPOST(req as any);
    expect(res.status).toBe(500);
  });

  it("returns 200 when no payment entity in payload", async () => {
    const body = JSON.stringify({ event: "payment.captured", payload: {} });
    const req = new Request("http://localhost:3004/api/payments/webhook", {
      method: "POST",
      body,
      headers: { "x-razorpay-signature": signBody(body), "Content-Type": "application/json" },
    });
    const res = await webhookPOST(req as any);
    expect(res.status).toBe(200);
  });
});
