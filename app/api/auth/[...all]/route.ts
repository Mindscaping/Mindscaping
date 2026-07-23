import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

// ponytail: pass through to Better Auth handler if configured, else 500
const handler = auth ? toNextJsHandler(auth).GET : () => NextResponse.json({ error: "not configured" }, { status: 500 });

export const GET = handler;
export const POST = auth ? toNextJsHandler(auth).POST : () => NextResponse.json({ error: "not configured" }, { status: 500 });
