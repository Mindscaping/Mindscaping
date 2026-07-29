// ponytail: protect /admin behind auth check. Allow static assets.
import { NextRequest, NextResponse } from "next/server";

const STATIC_EXTENSIONS = /\.(yml|yaml|json|css|js|png|jpg|svg|ico|woff2?)$/;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return;
  if (STATIC_EXTENSIONS.test(pathname)) return;

  const sessionToken = req.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl.origin));
  }
}

export const config = { matcher: ["/admin/:path*"] };
