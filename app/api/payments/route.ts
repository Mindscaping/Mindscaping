import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createOrder } from "@/lib/razorpay";

// Server-side price in paise (₹500). The client never decides the amount.
// Split into a per-session-type table when pricing diverges.
const SESSION_PRICE_PAISE = 50000;

// POST /api/payments - create a Razorpay order
export async function POST(req: NextRequest) {
  const user = await requireAuth("patient");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify session belongs to this patient
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session || session.patientId !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Check if payment already exists
  const existing = await prisma.payment.findUnique({ where: { sessionId } });
  if (existing) {
    return NextResponse.json({ error: "Payment already exists for this session" }, { status: 409 });
  }

  try {
    const order = await createOrder(SESSION_PRICE_PAISE, sessionId);

    const payment = await prisma.payment.create({
      data: {
        patientId: user.id,
        sessionId,
        razorpayOrderId: order.id,
        amount: SESSION_PRICE_PAISE,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id,
    });
  } catch {
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
  }
}

// GET /api/payments - list payments for current user
export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = user.role === "clinician"
    ? { session: { clinicianId: user.id } }
    : { patientId: user.id };

  const payments = await prisma.payment.findMany({
    where,
    include: {
      session: { select: { id: true, date: true, type: true } },
      patient: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payments });
}
