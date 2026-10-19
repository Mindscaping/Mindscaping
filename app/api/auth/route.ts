import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { pinnedOrigin } from "@/lib/origin";

// ponytail: Decap CMS GitHub OAuth — redirects to GitHub authorization
export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const state = randomBytes(32).toString("hex");
  const redirectUri = `${pinnedOrigin(req)}/api/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo user",
    response_type: "code",
    state,
  });
  const res = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes — enough to complete the redirect dance
  });
  return res;
}
