import { NextRequest, NextResponse } from "next/server";
import { pinnedOrigin } from "@/lib/origin";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return htmlError("Missing authorization code");

  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("oauth_state")?.value;
  if (!state || !cookieState || cookieState !== state) {
    return htmlError("Invalid OAuth state");
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === "your-client-id") {
    return htmlError("GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.");
  }

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });

  const data = await res.json();
  if (!data.access_token) {
    return htmlError(`GitHub auth failed: ${data.error || "unknown error"}`);
  }

  const origin = pinnedOrigin(req);

  return new NextResponse(
    `<html><body><script>
      (function() {
        var token = ${JSON.stringify(data.access_token)};
        var allowedOrigin = ${JSON.stringify(origin)};
        var receiveMessage = function(message) {
          window.opener.postMessage(
            'authorization:github:success:' + JSON.stringify({ token: token }),
            allowedOrigin
          );
          window.removeEventListener("message", receiveMessage, false);
        };
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", allowedOrigin);
      })();
    </script></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function htmlError(message: string) {
  return new NextResponse(
    `<html><body><h2>Authentication Error</h2><p>${message}</p><p>Close this window and try again.</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 400 },
  );
}
