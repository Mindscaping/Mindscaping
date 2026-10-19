import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function makeAdminRequest(authHeader?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (authHeader) headers["authorization"] = authHeader;
  return new NextRequest("http://localhost:3004/admin", { headers });
}

describe("middleware", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env.CMS_ADMIN_USER = "admin";
    process.env.CMS_ADMIN_PASS = "secret";
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it("passes through non-admin paths", () => {
    const req = new NextRequest("http://localhost:3004/team");
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("returns 401 when no auth header on admin path", () => {
    const res = middleware(makeAdminRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid credentials", () => {
    const encoded = btoa("wrong:creds");
    const res = middleware(makeAdminRequest(`Basic ${encoded}`));
    expect(res.status).toBe(401);
  });

  it("passes through with valid credentials", () => {
    const encoded = btoa("admin:secret");
    const res = middleware(makeAdminRequest(`Basic ${encoded}`));
    expect(res.status).toBe(200);
  });

  it("returns 500 when env vars are missing", () => {
    delete process.env.CMS_ADMIN_USER;
    delete process.env.CMS_ADMIN_PASS;
    const res = middleware(makeAdminRequest());
    expect(res.status).toBe(500);
  });

  it("returns 401 with WWW-Authenticate header", () => {
    const res = middleware(makeAdminRequest());
    expect(res.headers.get("WWW-Authenticate")).toBe('Basic realm="Mindscaping CMS"');
  });

  it("returns 401 for malformed base64 auth header (not 500)", () => {
    const res = middleware(makeAdminRequest("Basic !!!not-base64!!!"));
    expect(res.status).toBe(401);
  });

  it("authenticates passwords containing colons", () => {
    process.env.CMS_ADMIN_PASS = "s3cr3t:with:colons";
    const encoded = btoa("admin:s3cr3t:with:colons");
    const res = middleware(makeAdminRequest(`Basic ${encoded}`));
    expect(res.status).toBe(200);
  });
});
