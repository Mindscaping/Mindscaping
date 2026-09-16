import { NextResponse } from "next/server";
import { saveBooking, validateBooking, type BookingFormData } from "@/lib/booking";
import { publishEvent } from "@/lib/events";

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
