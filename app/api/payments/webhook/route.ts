import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/payments/webhook - Razorpay webhook handler
export async function POST(req: NextRequest) {
  const body = await req.json();

  // ponytail: verify webhook signature in production
  const { razorpay_order_id, razorpay_payment_id, status } = body;

  if (status === "captured" || status === "authorized") {
    await prisma.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: "captured",
      },
    });
  } else if (status === "failed") {
    await prisma.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: { status: "failed" },
    });
  }

  return NextResponse.json({ ok: true });
}
