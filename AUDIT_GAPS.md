# Audit Gaps — Agent Swarm Task Backlog

Generated: 2026-09-15
Scope: Full codebase audit (security, quality, testing, deployment readiness)

---

## Priority 1 — Security (Blockers)

### GAP-001: Razorpay webhook signature not verified
- **File:** `app/api/payments/webhook/route.ts:8`
- **Issue:** Webhook endpoint accepts any POST and updates payment status without verifying the Razorpay signature. Attacker can mark any payment as captured.
- **Fix:** Use `razorpay.webhooks.validateWebhook(body, signature, secret)` with `RAZORPAY_KEY_SECRET`. Razorpay sends signature in `X-Razorpay-Signature` header.
- **Verify:** Unit test that rejects requests with invalid/missing signature.

### GAP-002: IDOR on messages endpoint
- **File:** `app/api/messages/route.ts:39`
- **Issue:** Any authenticated user can read any conversation by passing任意 `with` user ID. No check that `withUserId` belongs to the user's clinician/patient relationship.
- **Fix:** Validate that `withUserId` is either the user's assigned clinician (if patient) or one of the user's assigned patients (if clinician). Query the Session table to confirm relationship.
- **Verify:** Test that patient A cannot read messages between patient B and clinician C.

### GAP-003: IDOR on notes endpoint
- **File:** `app/api/notes/route.ts`
- **Issue:** Clinician can pass任意 `patientId` query param and see notes for patients they're not assigned to. The `where` clause only filters by `clinicianId`, not by relationship.
- **Fix:** Verify the clinician has at least one Session with the requested `patientId` before returning notes.
- **Verify:** Test that clinician A cannot read notes for clinician B's patients.

### GAP-004: Self-registration allows clinician role
- **File:** `app/api/auth/register/route.ts:15`
- **Issue:** Registration endpoint accepts any `role` from request body. Anyone can register as a clinician and access all patient data.
- **Fix:** Either:
  - (a) Remove `role` from registration input, default to `patient`, require admin approval for clinician role, OR
  - (b) Add an invite/invite-code flow for clinicians, OR
  - (c) Lock clinician registration behind an admin-only endpoint.
- **Verify:** Test that POST to `/api/auth/register` with `role: "clinician"` is rejected.

### GAP-005: Revalidation secret in query string
- **File:** `app/api/revalidate/route.ts:7`
- **Issue:** `REVALIDATION_SECRET` accepted as URL query parameter (`?secret=xxx`). Query params appear in server logs, proxy logs, CDN logs, browser history.
- **Fix:** Only accept secret from request body or a custom header (e.g., `X-Revalidation-Secret`).
- **Verify:** Test that query param secret is rejected.

---

## Priority 2 — Security (Hardening)

### GAP-006: No rate limiting on auth endpoints
- **Files:** `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`
- **Issue:** No rate limiting. Brute-force attacks on login, mass account creation on register.
- **Fix:** Add rate limiting middleware. Options:
  - Cloudflare Rate Limiting rules (free tier supports 1 rule)
  - In-memory rate limiter (e.g., `ratelimit` package with upstash)
  - Edge-compatible rate limiter for Workers deployment
- **Verify:** Test that >N requests/min returns 429.

### GAP-007: No CSRF protection on state-changing routes
- **Files:** All POST/PUT/DELETE API routes
- **Issue:** Rely on `sameSite: lax` cookies. No CSRF tokens. Mostly mitigated by SameSite but not bulletproof (IE, subdomain attacks).
- **Fix:** Add CSRF token validation or use `SameSite: strict` (breaks some OAuth flows). Low priority if SameSite: lax is acceptable for threat model.
- **Verify:** N/A (design decision).

### GAP-008: No input sanitization on note content
- **File:** `app/api/notes/route.ts:38`
- **Issue:** `content` field is stored raw. If rendered as HTML anywhere (e.g., dashboard), XSS possible.
- **Fix:** Check if notes are rendered as HTML anywhere. If yes, sanitize with `DOMPurify` or escape. If rendered via `react-markdown`, ensure `rehype-sanitize` is used.
- **Verify:** Check all note rendering paths for XSS.

### GAP-009: No password strength validation
- **File:** `app/api/auth/register/route.ts`
- **Issue:** No minimum password length or complexity check. User can register with password "1".
- **Fix:** Add validation: minimum 8 characters, at least one number or special char.
- **Verify:** Test that weak passwords are rejected.

---

## Priority 3 — Testing Gaps

### GAP-010: Zero API route tests
- **Scope:** All 17 routes in `app/api/`
- **Issue:** No integration tests for any API endpoint. Auth flows, payment flows, CRUD operations are untested end-to-end.
- **Fix:** Add API route tests using `next/jest` or vitest with `msw` (Mock Service Worker) to test:
  - Auth: register → login → session → logout
  - Sessions: create, list, filter by role
  - Notes: CRUD with role enforcement
  - Messages: send, list, IDOR prevention
  - Payments: create order, webhook handling
  - Revalidate: secret validation
- **Verify:** `npm test` covers `app/api/**/*.test.ts`.

### GAP-011: No E2E test setup
- **Scope:** Entire app
- **Issue:** No Playwright, Cypress, or similar E2E framework configured. Critical user journeys (booking, payment, dashboard) are not tested in a real browser.
- **Fix:** Add Playwright config + E2E tests for:
  - Registration → Login → Dashboard
  - Booking flow → Payment → Confirmation
  - Clinician: create session → add note → view patient
  - Patient: view sessions → view notes → message clinician
- **Verify:** `npx playwright test` passes.

### GAP-012: `lib/team-sync.ts` at 0% test coverage
- **File:** `lib/team-sync.ts`
- **Issue:** `getTeamData()` and `getMergedTeamData()` have zero test coverage. Both functions untested.
- **Fix:** Add tests for:
  - `getTeamData` returns parsed JSON from `content/team.json`
  - `getTeamData` returns empty array on file missing
  - `getMergedTeamData` merges CMS data with Prisma clinician data
  - `getMergedTeamData` sets `hasAccount: true` when clinician found
- **Verify:** Coverage for `lib/team-sync.ts` reaches 95%+.

### GAP-013: Coverage threshold failing (93.8% funcs < 95%)
- **File:** `vitest.config.ts:16`
- **Issue:** Function coverage at 93.8%, threshold is 95%. Build will fail in CI.
- **Fix:** Add tests for uncovered functions (primarily in `team-sync.ts` and `Nav.tsx` lines 160-167).
- **Verify:** `npx vitest run --coverage` meets all thresholds.

### GAP-014: Lint errors in test files (20 errors)
- **Files:** `test/lib/auth.test.ts`, `test/lib/db.test.ts`, `test/lib/razorpay.test.ts`
- **Issue:** 20 `@typescript-eslint/no-explicit-any` errors from `as any` casts in mock return types.
- **Fix:** Replace `as any` with proper type assertions or use `vi.fn<() => Promise<...>>()` generic typing.
- **Verify:** `npm run lint` passes with 0 errors.

---

## Priority 4 — Deployment Readiness

### GAP-015: `lib/team-sync.ts` uses Node.js `fs` module
- **File:** `lib/team-sync.ts:1`
- **Issue:** `readFileSync` from `node:fs` will crash on Cloudflare Workers (no filesystem). Will also fail on Deno Deploy, Vercel Edge Runtime.
- **Fix:** For Workers: import `content/team.json` as a module (`import teamData from '../content/team.json'`) or use Workers KV/R2. For Vercel: keep as-is (Node.js runtime).
- **Verify:** Build succeeds with `@opennextjs/cloudflare`.

### GAP-016: `lib/razorpay.ts` singleton won't work in serverless
- **File:** `lib/razorpay.ts:5-10`
- **Issue:** Module-level singleton (`let razorpay: Razorpay | null = null`) is per-invocation in serverless. Each request creates a new instance. Not a bug but wasteful — the `if (!razorpay)` check is meaningless.
- **Fix:** Either:
  - (a) Remove the singleton pattern, create new instance each time (simpler, no false assumption), OR
  - (b) Use `globalThis` caching like `lib/db.ts` does.
- **Verify:** No functional change, just correctness.

### GAP-017: `lib/booking.ts` uses in-memory store
- **File:** `lib/booking.ts:73`
- **Issue:** `const bookings: Booking[] = []` — bookings are lost on server restart. Incompatible with serverless (each invocation has empty array).
- **Fix:** Replace with Prisma-backed storage (write to the `Session` model or a new `BookingRequest` model).
- **Verify:** Bookings persist across requests.

### GAP-018: `next.config.ts` `staleTimes` set to 91 days
- **File:** `next.config.ts:6`
- **Issue:** `staleTimes: { dynamic: 7776000, static: 7776000 }` = 91 days. This is extremely aggressive. Dynamic pages won't revalidate for 3 months.
- **Fix:** Reduce to reasonable values (e.g., `dynamic: 60`, `static: 3600`) or remove entirely to use Next.js defaults.
- **Verify:** Dynamic pages reflect updates within expected timeframe.

### GAP-019: No `DATABASE_URL` fallback for production
- **File:** `lib/db.ts`
- **Issue:** Prisma client uses `DATABASE_URL` from env. No validation that it's set. Will crash at runtime with cryptic error if missing.
- **Fix:** Add startup check: `if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required')`.
- **Verify:** App fails fast with clear error if DB URL missing.

---

## Priority 5 — Quality & Code Health

### GAP-020: No TypeScript strict mode
- **File:** `tsconfig.json`
- **Issue:** Check if `strict: true` is enabled. Many `as any` casts suggest it's not.
- **Fix:** Enable `strict: true`, fix resulting type errors.
- **Verify:** `npx tsc --noEmit` passes.

### GAP-021: No CI/CD pipeline
- **Scope:** Repository
- **Issue:** No GitHub Actions, no CI config. Tests and lint aren't run automatically.
- **Fix:** Add `.github/workflows/ci.yml`:
  - Run on push/PR to main
  - Steps: install → lint → test → build
  - Cache node_modules
- **Verify:** CI runs green on PR.

### GAP-022: No environment variable validation
- **Scope:** All API routes
- **Issue:** `process.env.RAZORPAY_KEY_ID`, `AUTH_SECRET`, etc. used without validation. App will silently use empty strings.
- **Fix:** Add a `lib/env.ts` that validates required env vars at startup and throws clear errors.
- **Verify:** App crashes with helpful message if env vars missing.

### GAP-023: No error monitoring/logging
- **Scope:** All API routes
- **Issue:** Errors are caught and returned as generic `{ error: "..." }`. No structured logging, no error tracking (Sentry, etc.).
- **Fix:** Add structured logging for errors. At minimum, `console.error` with context. For production: integrate Sentry or similar.
- **Verify:** Errors are logged with request context.

### GAP-024: `postinstall` script may fail on CI/Workers
- **File:** `package.json:13`
- **Issue:** `"postinstall": "prisma skills sync || exit 0"` — the `|| exit 0` masks failures. May cause issues on Cloudflare's build environment.
- **Fix:** Remove or add platform check: `"postinstall": "node -e \"process.env.CF_PAGES || process.exit(0)\" && prisma skills sync || exit 0"`.
- **Verify:** Build succeeds on Cloudflare Workers.

---

## Summary Matrix

| ID     | Category       | Severity | File(s)                                | Est. Effort |
|--------|----------------|----------|----------------------------------------|-------------|
| 001    | Security       | Critical | webhook/route.ts                       | 30min       |
| 002    | Security       | Critical | messages/route.ts                      | 1hr         |
| 003    | Security       | Critical | notes/route.ts                         | 1hr         |
| 004    | Security       | Critical | register/route.ts                      | 30min       |
| 005    | Security       | High     | revalidate/route.ts                    | 15min       |
| 006    | Security       | High     | login/route.ts, register/route.ts      | 1hr         |
| 007    | Security       | Medium   | All POST routes                        | 2hr         |
| 008    | Security       | Medium   | notes/route.ts                         | 30min       |
| 009    | Security       | Medium   | register/route.ts                      | 15min       |
| 010    | Testing        | High     | app/api/                               | 4hr         |
| 011    | Testing        | High     | Entire app                             | 6hr         |
| 012    | Testing        | Medium   | lib/team-sync.ts                       | 30min       |
| 013    | Testing        | Medium   | vitest.config.ts                       | 30min       |
| 014    | Quality        | Low      | test/lib/*.test.ts                     | 30min       |
| 015    | Deployment     | High     | lib/team-sync.ts                       | 1hr         |
| 016    | Deployment     | Low      | lib/razorpay.ts                        | 15min       |
| 017    | Deployment     | High     | lib/booking.ts                         | 2hr         |
| 018    | Deployment     | Medium   | next.config.ts                         | 5min        |
| 019    | Deployment     | Medium   | lib/db.ts                              | 10min       |
| 020    | Quality        | Medium   | tsconfig.json                          | 1hr         |
| 021    | Quality        | Medium   | .github/workflows/                     | 30min       |
| 022    | Quality        | Medium   | lib/env.ts (new)                       | 30min       |
| 023    | Quality        | Low      | All API routes                         | 2hr         |
| 024    | Deployment     | Low      | package.json                           | 10min       |

**Total estimated effort:** ~24 hours
**Critical blockers (must fix before any deployment):** GAP-001, 002, 003, 004
