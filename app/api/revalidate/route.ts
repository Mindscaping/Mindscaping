import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// ponytail: single webhook for ISR cache purge — called by GitHub on content push
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const secret = body.secret || req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  const path = body.path || "/";
  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path });
}
