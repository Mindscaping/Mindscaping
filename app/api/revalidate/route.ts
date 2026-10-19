import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// On-demand ISR: called by GitHub webhook on content push
// Maps changed files to the pages that need revalidation
const FILE_TO_PATHS: Record<string, string[]> = {
  "content/team.json": ["/", "/team", "/api/team"],
  "content/faq.json": ["/", "/faq"],
  "content/testimonials.json": ["/"],
  "content/gallery.json": ["/", "/gallery"],
  "content/blog/": ["/", "/blog"],
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const secret = body.secret;
  const expected = process.env.REVALIDATION_SECRET || "";

  if (!secret || typeof secret !== "string" || !timingSafeCompare(String(secret), expected)) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  const commitsRaw = body.commits;
  if (commitsRaw !== undefined && commitsRaw !== null && !Array.isArray(commitsRaw)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const commits: unknown[] = Array.isArray(commitsRaw) ? commitsRaw : [];
  for (const c of commits) {
    if (c == null || typeof c !== "object") continue;
    for (const key of ["added", "modified"] as const) {
      const v = (c as Record<string, unknown>)[key];
      if (v !== undefined && v !== null && !Array.isArray(v)) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
    }
  }

  const files: string[] = commits.flatMap((c) => {
    const rec = (typeof c === "object" && c !== null ? c : {}) as Record<string, unknown>;
    const added = Array.isArray(rec.added)
      ? rec.added.filter((f): f is string => typeof f === "string")
      : [];
    const modified = Array.isArray(rec.modified)
      ? rec.modified.filter((f): f is string => typeof f === "string")
      : [];
    return [...added, ...modified];
  });

  const pathsToRevalidate = new Set<string>(["/"]);

  for (const file of files) {
    for (const [pattern, paths] of Object.entries(FILE_TO_PATHS)) {
      if (file.startsWith(pattern) || file === pattern) {
        paths.forEach((p) => pathsToRevalidate.add(p));
      }
    }
  }

  pathsToRevalidate.forEach((path) => revalidatePath(path));

  return NextResponse.json({
    revalidated: true,
    paths: Array.from(pathsToRevalidate),
    files,
  });
}
