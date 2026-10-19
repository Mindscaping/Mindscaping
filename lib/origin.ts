import { NextRequest } from "next/server";

// Pinned app origin: APP_ORIGIN env wins (trailing slashes stripped), else the
// request's own origin. x-forwarded-* headers are never trusted here.
export function pinnedOrigin(req: NextRequest): string {
  const env = process.env.APP_ORIGIN;
  if (env) return env.replace(/\/+$/, "");
  return req.nextUrl.origin;
}
