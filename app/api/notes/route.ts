import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/notes - list notes
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");
  const type = searchParams.get("type"); // "session" | "patient"

  const where: Record<string, unknown> = user.role === "clinician"
    ? { clinicianId: user.id }
    : { patientId: user.id };

  if (patientId) where.patientId = patientId;
  if (type) where.type = type;

  const notes = await prisma.note.findMany({
    where,
    include: {
      clinician: { select: { id: true, name: true } },
      patient: { select: { id: true, name: true } },
      session: { select: { id: true, date: true, type: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ notes });
}

// POST /api/notes - create a note (clinician only)
export async function POST(req: NextRequest) {
  const user = await requireAuth("clinician");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId, sessionId, type, content } = await req.json();
  if (!patientId || !type || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      clinicianId: user.id,
      patientId,
      sessionId: sessionId || null,
      type,
      content,
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}

// PUT /api/notes - update a note
export async function PUT(req: NextRequest) {
  const user = await requireAuth("clinician");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, content } = await req.json();
  if (!id || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await prisma.note.updateMany({
    where: { id, clinicianId: user.id },
    data: { content },
  });

  return NextResponse.json({ ok: true });
}
