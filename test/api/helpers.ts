import { NextRequest } from "next/server";

interface MockRequestOptions {
  method?: string;
  url?: string;
  body?: unknown;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}

export function mockRequest(opts: MockRequestOptions = {}): NextRequest {
  const {
    method = "GET",
    url = "http://localhost:3004/api/test",
    body,
    cookies = {},
    headers = {},
  } = opts;

  const allHeaders = new Headers({ "Content-Type": "application/json", ...headers });

  const req = new NextRequest(url, {
    method,
    headers: allHeaders,
    ...(body !== undefined && method !== "GET" ? { body: JSON.stringify(body) } : {}),
  });

  for (const [key, value] of Object.entries(cookies)) {
    req.cookies.set(key, value);
  }

  return req;
}

export function mockClinicianRequest(overrides: MockRequestOptions = {}): NextRequest {
  return mockRequest({
    cookies: { session: "clinician-token" },
    ...overrides,
  });
}

export function mockPatientRequest(overrides: MockRequestOptions = {}): NextRequest {
  return mockRequest({
    cookies: { session: "patient-token" },
    ...overrides,
  });
}

export function mockCsrfRequest(overrides: MockRequestOptions = {}): NextRequest {
  return mockRequest({
    cookies: { session: "clinician-token", csrf_token: "valid-csrf" },
    headers: { "x-csrf-token": "valid-csrf" },
    ...overrides,
  });
}
