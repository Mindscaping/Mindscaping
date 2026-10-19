import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as authGET } from "@/app/api/auth/route";
import { GET as callbackGET } from "@/app/api/callback/route";
import { GET as configGET } from "@/app/admin/config.yml/route";

describe("GET /api/auth (OAuth redirect)", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env.GITHUB_CLIENT_ID = "test-client-id";
  });

  afterEach(() => {
    process.env = { ...origEnv };
    vi.unstubAllEnvs();
  });

  it("redirects to GitHub OAuth with correct params", async () => {
    const req = new NextRequest("http://localhost:3004/api/auth");
    const res = await authGET(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    const location = res.headers.get("location");
    expect(location).toContain("https://github.com/login/oauth/authorize");
    expect(location).toContain("client_id=test-client-id");
    expect(location).toContain("response_type=code");
    expect(location).toContain("scope=repo");
  });

  it("ignores x-forwarded-host (uses req.nextUrl.origin)", async () => {
    const req = new NextRequest("http://localhost:3004/api/auth", {
      headers: {
        "x-forwarded-host": "evil.example",
        "x-forwarded-proto": "https",
      },
    });
    const res = await authGET(req);
    const location = res.headers.get("location")!;
    expect(location).toContain("redirect_uri=http%3A%2F%2Flocalhost%3A3004%2Fapi%2Fcallback");
    expect(location).not.toContain("evil.example");
  });

  it("falls back to req.nextUrl.origin without forwarded headers", async () => {
    const req = new NextRequest("http://localhost:3004/api/auth");
    const res = await authGET(req);
    const location = res.headers.get("location")!;
    expect(location).toContain("redirect_uri=");
    expect(location).toContain("api%2Fcallback");
  });

  it("uses APP_ORIGIN env (trailing slash stripped) when set", async () => {
    vi.stubEnv("APP_ORIGIN", "https://mindscaping.in/");
    const req = new NextRequest("http://localhost:3004/api/auth", {
      headers: { "x-forwarded-host": "evil.example" },
    });
    const res = await authGET(req);
    const location = res.headers.get("location")!;
    expect(location).toContain("redirect_uri=https%3A%2F%2Fmindscaping.in%2Fapi%2Fcallback");
    expect(location).not.toContain("evil.example");
  });

  it("sets oauth_state cookie and includes state in authorize URL", async () => {
    const req = new NextRequest("http://localhost:3004/api/auth");
    const res = await authGET(req);
    const setCookie = res.headers.get("set-cookie") || "";
    const stateMatch = setCookie.match(/oauth_state=([^;]+)/);
    expect(stateMatch).toBeTruthy();
    const state = stateMatch![1];
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
    expect(setCookie).toContain("Path=/");
    const location = res.headers.get("location")!;
    expect(location).toContain(`state=${encodeURIComponent(state)}`);
  });
});

describe("GET /api/callback (OAuth callback)", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env.GITHUB_CLIENT_ID = "test-client-id";
    process.env.GITHUB_CLIENT_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env = { ...origEnv };
    vi.restoreAllMocks();
  });

  it("returns 400 for missing code", async () => {
    const req = new NextRequest("http://localhost:3004/api/callback");
    const res = await callbackGET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when env vars are missing", async () => {
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    const req = new NextRequest("http://localhost:3004/api/callback?code=abc123");
    const res = await callbackGET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when env vars are placeholder", async () => {
    process.env.GITHUB_CLIENT_ID = "your-client-id";
    process.env.GITHUB_CLIENT_SECRET = "your-secret";
    const req = new NextRequest("http://localhost:3004/api/callback?code=abc123");
    const res = await callbackGET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when GitHub returns no access_token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ error: "bad_verification_code" }),
    }));
    const req = new NextRequest("http://localhost:3004/api/callback?code=bad&state=s1");
    req.cookies.set("oauth_state", "s1");
    const res = await callbackGET(req);
    expect(res.status).toBe(400);
  });

  it("returns HTML with postMessage script on success when state matches", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ access_token: "gho_test123" }),
    }));
    const req = new NextRequest("http://localhost:3004/api/callback?code=good&state=s1");
    req.cookies.set("oauth_state", "s1");
    const res = await callbackGET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("postMessage");
    expect(html).toContain("gho_test123");
  });

  it("returns 400 and does not call fetch on mismatched state", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const req = new NextRequest("http://localhost:3004/api/callback?code=good&state=attacker");
    req.cookies.set("oauth_state", "legit");
    const res = await callbackGET(req);
    expect(res.status).toBe(400);
    const html = await res.text();
    expect(html).toContain("Invalid OAuth state");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 and does not call fetch when oauth_state cookie is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const req = new NextRequest("http://localhost:3004/api/callback?code=good&state=s1");
    const res = await callbackGET(req);
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("embeds pinned origin in postMessage script, not x-forwarded-host", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ access_token: "gho_test123" }),
    }));
    const req = new NextRequest("http://localhost:3004/api/callback?code=good&state=s1", {
      headers: { "x-forwarded-host": "evil.example", "x-forwarded-proto": "https" },
    });
    req.cookies.set("oauth_state", "s1");
    const res = await callbackGET(req);
    const html = await res.text();
    expect(html).toContain('var allowedOrigin = "http://localhost:3004"');
    expect(html).not.toContain("evil.example");
  });
});

describe("GET /admin/config.yml (base_url origin)", () => {
  const origEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...origEnv };
    vi.unstubAllEnvs();
  });

  it("ignores x-forwarded-host — base_url uses req.nextUrl.origin", () => {
    const req = new NextRequest("http://localhost:3004/admin/config.yml", {
      headers: { "x-forwarded-host": "evil.example", "x-forwarded-proto": "https" },
    });
    const res = configGET(req);
    expect(res.status).toBe(200);
    // handler is sync in current impl; text() resolves on the returned Response
    return res.text().then((yaml) => {
      expect(yaml).toContain("base_url: http://localhost:3004");
      expect(yaml).not.toContain("evil.example");
    });
  });

  it("uses APP_ORIGIN env when set", () => {
    vi.stubEnv("APP_ORIGIN", "https://mindscaping.in/");
    const req = new NextRequest("http://localhost:3004/admin/config.yml", {
      headers: { "x-forwarded-host": "evil.example" },
    });
    const res = configGET(req);
    return res.text().then((yaml) => {
      expect(yaml).toContain("base_url: https://mindscaping.in");
      expect(yaml).not.toContain("evil.example");
    });
  });
});
