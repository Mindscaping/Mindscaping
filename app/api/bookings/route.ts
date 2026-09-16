import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveBooking, validateBooking, type BookingFormData } from "@/lib/booking";
import { publishEvent } from "@/lib/events";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  const where = email ? { email } : {};
  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body: BookingFormData = await request.json();
    const errors = validateBooking(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const booking = await saveBooking(body);

    // ponytail: push SSE event for real-time admin notifications
    publishEvent("booking", {
      id: booking.id,
      name: booking.name,
      sessionType: booking.sessionType,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
