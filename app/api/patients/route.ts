import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/patients - list all patients (clinician only)
export async function GET() {
  const user = await requireAuth("clinician");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patients = await prisma.user.findMany({
    where: { role: "patient" },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ patients });
}
