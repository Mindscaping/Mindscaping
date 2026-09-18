import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

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

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  const files: string[] = body.commits?.flatMap((c: Record<string, unknown>) => [
    ...(c.added as string[] || []),
    ...(c.modified as string[] || []),
  ]) || [];

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
