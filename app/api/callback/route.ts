import { NextRequest, NextResponse } from "next/server";

// ponytail: GitHub OAuth callback — exchanges code for token, returns HTML that sends token to Decap CMS
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "no code" }, { status: 400 });

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await res.json();
  const token = data.access_token;

  if (!token) return NextResponse.json({ error: "no token" }, { status: 400 });

  // Return HTML that sends token to Decap CMS via postMessage
  return new NextResponse(
    `<html><body><script>
      (function() {
        function recieveMessage(e){
          if (!e.data.command) return;
          if (e.data.command === 'authorizing') {
            window.opener.postMessage({ command: 'authorization', token: { access_token: '${token}', token_type: 'bearer' } }, '*');
          }
        }
        window.addEventListener('message', recieveMessage, false);
        window.opener.postMessage({ command: 'authorizing' }, '*');
      })()
    </script></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
