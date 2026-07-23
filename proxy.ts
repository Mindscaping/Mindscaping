// ponytail: protect /admin behind auth check. Redirects unauthenticated to login.
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return;

  const sessionToken = req.cookies.get("better-auth.session")?.value;
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = { matcher: ["/admin/:path*"] };
