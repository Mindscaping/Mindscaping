import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOrdersCreate = vi.fn().mockResolvedValue({ id: "order_123", amount: 50000, currency: "INR" });

vi.mock("razorpay", () => {
  return {
    default: function MockRazorpay() {
      return { orders: { create: mockOrdersCreate } };
    },
  };
});

vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));

import { getRazorpay, createOrder } from "@/lib/razorpay";

describe("razorpay lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getRazorpay as any).razorpay = undefined;
  });

  it("getRazorpay returns an instance", () => {
    const instance = getRazorpay();
    expect(instance).toBeDefined();
  });

  it("createOrder returns order object", async () => {
    const order = await createOrder(50000, "receipt_1");
    expect(order).toEqual({ id: "order_123", amount: 50000, currency: "INR" });
    expect(mockOrdersCreate).toHaveBeenCalledWith({ amount: 50000, currency: "INR", receipt: "receipt_1" });
  });
});
