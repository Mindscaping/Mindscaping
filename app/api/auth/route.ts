import { NextRequest, NextResponse } from "next/server";

// ponytail: Decap CMS GitHub OAuth — redirects to GitHub authorization
export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const origin = forwardedHost
    ? `${forwardedProto || "https"}://${forwardedHost}`
    : req.nextUrl.origin;
  const redirectUri = `${origin}/api/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo user",
    response_type: "code",
  });
  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
