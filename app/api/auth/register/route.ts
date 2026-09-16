import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, name, phone, role } = await req.json();

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (role !== "clinician" && role !== "patient") {
    return NextResponse.json({ error: "Role must be clinician or patient" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role, phone: phone || null },
  });

  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "clinician" | "patient",
  });

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
