import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    const decoded = atob(authHeader.split(" ")[1] || "");
    const [user, pass] = decoded.split(":");
    const expectedUser = process.env.CMS_ADMIN_USER || "admin";
    const expectedPass = process.env.CMS_ADMIN_PASS || "mindscaping2026";

    if (user === expectedUser && pass === expectedPass) {
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
