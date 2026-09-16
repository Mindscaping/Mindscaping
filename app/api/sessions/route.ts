import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/sessions - list sessions for current user
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  const where = user.role === "clinician"
    ? { clinicianId: user.id, ...(patientId ? { patientId } : {}) }
    : { patientId: user.id };

  const sessions = await prisma.session.findMany({
    where,
    include: { clinician: { select: { id: true, name: true, email: true } }, patient: { select: { id: true, name: true, email: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ sessions });
}

// POST /api/sessions - create a session (clinician only)
export async function POST(req: NextRequest) {
  const user = await requireAuth("clinician");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId, date, type } = await req.json();
  if (!patientId || !date || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const session = await prisma.session.create({
    data: {
      clinicianId: user.id,
      patientId,
      date: new Date(date),
      type,
    },
  });

  return NextResponse.json({ session }, { status: 201 });
}
