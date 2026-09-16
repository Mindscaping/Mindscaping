# Code Review — Mindscaping (Next.js)

**Date:** 2026-09-15
**Tests:** 189 passing (97%+ coverage)

## Critical
None

## High
1. **`lib/team-sync.ts` uses `readFileSync`** — Will break on Cloudflare Workers (no filesystem). Must bundle JSON or use D1/KV. (`lib/team-sync.ts:6`)
   - Status: Documented in CLOUDFLARE_WORKERS_DEPLOYMENT.md as known limitation.
2. **Auth middleware not consistently applied** — Not all API routes verify session. `GET /api/team`, `GET /api/bookings` may be public. Verify intentional.
   - Check: Are booking listings supposed to be public?

## Medium
1. **SQLite for dev** — Prisma schema uses SQLite. Fine for local dev, but must switch to PostgreSQL for production (Cloudflare D1 or external).
   - Status: Documented in CLOUDFLARE_WORKERS_DEPLOYMENT.md.
2. **In-memory events system** — `lib/events.ts` uses in-memory pub/sub. Won't work across multiple instances. Fine for single-instance, but needs Redis/Kafka for scaling.
3. **No rate limiting on API routes** — Auth endpoints (`/api/auth/login`, `/api/auth/register`) have no rate limiting. Vulnerable to brute force.
4. **Razorpay webhook signature verification** — `app/api/payments/route.ts` needs to verify webhook signatures in production.

## Low
1. **No error boundaries** — No React ErrorBoundary components. Unhandled errors will crash entire page.
2. **Missing Prisma indexes** — No explicit indexes on commonly queried fields (email, userId). Add for performance.
3. **No CSRF protection on state-changing API routes** — POST/DELETE routes don't verify CSRF tokens.

## Positive Findings
- 189 tests all passing
- 97%+ code coverage across statements, branches, functions, lines
- Prisma schema well-designed with 5 models
- JWT auth with role-based access (clinician/patient)
- Razorpay integration with order creation + webhook
- Clinician-CMS team sync implemented
- Hosting research documented
- Cloudflare Workers deployment documented
- axe-core accessibility audit completed
- WCAG compliance tested
