import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  const expectedUser = process.env.CMS_ADMIN_USER;
  const expectedPass = process.env.CMS_ADMIN_PASS;

  if (!expectedUser || !expectedPass) {
    return new NextResponse("Server misconfiguration", { status: 500 });
  }

  const authHeader = req.headers.get("authorization");

  if (authHeader && authHeader.startsWith("Basic ")) {
    const decoded = atob(authHeader.split(" ")[1] || "");
    const [user, pass] = decoded.split(":");

    if (
      user &&
      pass &&
      timingSafeCompare(user, expectedUser) &&
      timingSafeCompare(pass, expectedPass)
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Mindscaping CMS"' },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
