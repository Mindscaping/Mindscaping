import { NextResponse } from "next/server";
import { publishEvent, type AppEvent } from "@/lib/events";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body as { type: AppEvent["type"]; data: Record<string, unknown> };

    if (!type || !data) {
      return NextResponse.json({ error: "type and data required" }, { status: 400 });
    }

    const event = publishEvent(type, data);
    return NextResponse.json({ event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
