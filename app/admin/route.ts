// ponytail: serve Decap CMS admin SPA directly (bypasses React rendering)
import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export function GET() {
  const html = readFileSync(path.join(process.cwd(), "public", "admin", "index.html"), "utf-8");
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
