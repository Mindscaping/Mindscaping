import { NextResponse } from "next/server";
import { publishEvent, type AppEvent } from "@/lib/events";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await requireAuth("clinician");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
