import { NextRequest, NextResponse } from "next/server";

// ponytail: Decap CMS GitHub OAuth — redirects to GitHub authorization
export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const redirectUri = `${req.nextUrl.origin}/api/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo user",
    response_type: "code",
  });
  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
