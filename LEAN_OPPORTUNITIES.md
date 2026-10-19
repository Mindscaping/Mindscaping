# Lean Opportunities — Mindscaping

Audit date: 2026-10-15 (whole-repo sweep, working tree at ~cf8878d + uncommitted TDD-red changes).
Every item below was grep-verified across the whole tree (source, tests, config, string references)
unless marked otherwise. Line counts are approximate. Correctness/security findings from the same
audit are not repeated here — this file is only about code that should not exist, should be
smaller, or should be one copy instead of two.

Savings total: **~550 lines of app code + ~250 lines of now-dead tests, −2 dependencies.**

---

## A. Delete — dead code and dead files

### A1. CSRF layer — broken gate, delete it (~120 lines incl. tests)
- `lib/csrf.ts` (26), checks in `app/api/bookings/route.ts:35,66`, `app/api/notes/route.ts:42,68`,
  `app/api/messages/route.ts:81`, `generateToken()` calls in `app/api/auth/login/route.ts:8` and
  `app/api/auth/register/route.ts:8`, `test/lib/csrf.test.ts`, `mockCsrfRequest` in
  `test/api/helpers.ts:48-55`, `vi.mock("@/lib/csrf")` blocks in ~6 API test files.
- No client code ever sends `x-csrf-token` (grep: zero hits outside `app/api`), so every gated
  route returns 403 in the real product. The session cookie is already `SameSite=strict` (login)
  and `SameSite=lax` (register), which is the standard CSRF defense for state-changing POSTs.
- Fix: delete `lib/csrf.ts` and all checks; keep the SameSite cookies. If CSRF checks are ever
  wanted again, they need a client that reads the cookie and sends the header plus a refresh
  endpoint (the cookie also dies after 1h) — do that as one complete feature or not at all.
- Note: the 1h-expiry-with-no-refresh design means this layer could not have worked even if a
  client sent the header.

### A2. Real-time notification stack — renders to nobody (~230 code + ~150 test lines)
- `components/sections/LiveNotifications.tsx` (56), `hooks/useSSE.ts` (48),
  `app/api/events/route.ts` (58), `app/api/events/push/route.ts` (24), `lib/events.ts` (37),
  `publishEvent` block in `app/api/bookings/route.ts:80-86`, plus their test files
  (`test/components/LiveNotifications.test.tsx`, `test/hooks/useSSE.test.tsx`,
  `test/api/events.test.ts`, `test/lib/events.test.ts`).
- Grep confirms `LiveNotifications` is imported by no page; `/api/events` has no client.
  The booking POST publishes SSE events that no listener ever receives.
- Fix: delete the stack, or render `LiveNotifications` on the clinician dashboard and accept the
  `lib/events.ts:1` shortcut (in-memory pub/sub only works single-instance). Keeping both halves
  disconnected is the worst option.

### A3. `docker-entrypoint.sh` — never called (5 lines)
- The Dockerfile `CMD` (line 20) and `docker-compose.yml:16` both inline
  `prisma db push && next start`; nothing references the script (grep: only a stale
  `.next/dev/cache` artifact matches).
- Fix: delete the file (or make the CMD use it — deleting is smaller).

### A4. Dead exported helpers (~12 lines)
- `lib/booking.ts:73-75` `generateBookingId()` and `:93-95` `getBookings()` — referenced only by
  their own tests (`test/lib/booking.test.ts`). Nothing in `app/` calls them.
- `lib/events.ts:35-37` `getListenerCount()` — only its own test (dies with A2 anyway).
- `app/api/events/route.ts:45` `const originalCancel = controller.close.bind(controller)` —
  assigned, never used.
- Unused imports: `generateToken` imported in `app/api/notes/route.ts:4` and
  `app/api/messages/route.ts:4` but never called there.
- Fix: delete; drop the tests that exist only to cover the dead exports.

### A5. Tracked junk in git (~65 lines + cache)
- `.logs/subtask2.log` (61 lines) and `.vitest/json/output.json` (test-runner cache) are committed.
- Fix: `git rm`, then add `.logs/`, `.vitest/`, `test-results/`, `.opencode/` to `.gitignore`
  (~250 untracked `.opencode/goals/...` dirs and the Playwright `test-results/` dir currently
  pollute `git status`).

### A6. Duplicate hardcoded CMS fallback content (~90 lines)
- `components/sections/AboutSection.tsx:12-17`, `ValuesSection.tsx:11-32`,
  `ApproachSection.tsx:14-19`, `ProcessSection.tsx:10-29`, `Hero.tsx` fallback strings,
  `ContactSection.tsx` fallback strings, `app/privacy/page.tsx:9-17` `defaultSections`.
- All of this content now lives in `content/*.json` (CMS-managed). The JSON files are committed,
  so the fallbacks are a second source of truth that drifts (privacy fallback says
  "July 2026", `content/privacy.json` says "January 2026"). `ContactSection` is rendered on the
  homepage *without* content (`app/page.tsx:54`), which is the only reason its fallbacks still
  show — pass `getContactContent()` there and the fallbacks are unreachable.
- Two of the fallback strings are also latent bugs: they put HTML entities in JS strings
  (`Hero.tsx:40` `"…&middot;…"`, `ApproachSection.tsx:16-17` `"&ldquo;…"`), which render as
  literal `&middot;` text whenever the fallback fires.
- Fix: pass content props everywhere, delete the hardcoded defaults.

### A7. Stale docs (~37 lines or a rewrite)
- `CODE_REVIEW.md` (2026-09-15) claims "189 tests passing", "no rate limiting", "no CSRF",
  "no indexes" — all since addressed — and references `CLOUDFLARE_WORKERS_DEPLOYMENT.md`, which
  does not exist in the repo.
- `WALKTHROUGH.md` says the site runs on localhost:3004 "in Docker"; docker-compose maps 3000.
- Fix: delete or refresh in one pass. A wrong review doc is worse than none.

---

## B. Merge — copies that must change together

### B1. `timingSafeCompare` defined twice
- `middleware.ts:4-9` and `app/api/revalidate/route.ts:5-10` are identical; the Razorpay webhook
  (`app/api/payments/webhook/route.ts:15`) has a third, broken variant (no length check → throws).
- Fix: one exported helper in `lib/` (e.g. `lib/crypto.ts`), used by all three. Net −10 lines and
  fixes the webhook crash in the same stroke.

### B2. Session-cookie block duplicated in login and register
- `app/api/auth/login/route.ts:41-48` and `app/api/auth/register/route.ts:53-60` are near-copies
  (they have already drifted: `strict` vs `lax` SameSite).
- Fix: `setSessionCookie(res, user)` in `lib/auth.ts`. Net −8 lines; picks one SameSite policy.

### B3. "Highlight a word in the heading" IIFE copied 6×
- `Hero.tsx:43-53`, `AboutSection.tsx:27-29`, `ValuesSection.tsx:42-44`,
  `ApproachSection.tsx:32-34`, `ProcessSection.tsx:40-42`, `ContactSection.tsx:25-27` —
  each splits a heading on a word and wraps it in `<em>`.
- Fix: one small `Highlight({ text, word })` component. Net −25 lines, six fewer places to get
  the entity/escaping wrong.

### B4. Team card grid duplicated
- `TeamSection.tsx:37-68` and `SchoolCounsellingSection.tsx:48-76` are the same member-card grid
  (photo fallback `⊞`, role, bio) with tiny differences (`hasAccount` badge, credentials).
- Fix: one `MemberGrid` component with optional extras. Net −40 lines.

### B5. Clinician session-type list is a stale subset
- `app/dashboard/clinician/page.tsx:362-366` hardcodes individual/couples/family/group;
  `lib/booking.ts:11-18` `SESSION_TYPES` has six (adds corporate, school). The lists must change
  together and already disagree.
- Fix: import `SESSION_TYPES` in the dashboard. −5 lines, removes the drift.

### B6. Therapist list hardcoded in BookingForm
- `components/sections/BookingForm.tsx:14-23` `THERAPIST_OPTIONS` names seven therapists;
  `content/team.json` (CMS) is the managed source for exactly this list.
- Fix: pass team names from the server (`getTeamMembers()` is already loaded on any page that
  renders the form). −10 lines; CMS edit becomes the single change.

### B7. Security headers set in two config files
- Identical `X-Frame-Options`/`nosniff`/`Referrer-Policy` in `next.config.ts:7-20` and
  `vercel.json:7-16` (next.config additionally has HSTS + Permissions-Policy).
- Fix: keep the `next.config.ts` copy (applies on both deploys), delete the `vercel.json` block.
  −10 lines.

### B8. Nav link list duplicated desktop vs mobile
- `components/layout/Nav.tsx:56-72` and `:121-139` render the same `publicLinks` + Research link
  with different classNames; auth links duplicated again at `:74-104` and `:141-174`.
- Fix: render one array with a class suffix. −25 lines. (Minor; only if Nav is touched anyway.)

### B9. Auth-check-then-redirect block copied 5×
- `app/dashboard/page.tsx:9-22`, `dashboard/clinician/page.tsx:60-71`,
  `dashboard/patient/page.tsx:47-58`, `app/login/page.tsx:15-26`, `app/register/page.tsx:15-26`,
  `app/messages/MessagesContent.tsx:34-45` all fetch `/api/auth/me` and redirect with slight
  variations.
- Fix: one `useSessionUser()` hook. −40 lines. (Optional; the copies are small.)

---

## C. Replace with the platform

### C1. Razorpay checkout.js loaded on every page for every visitor
- `app/layout.tsx:43` injects `https://checkout.razorpay.com/v1/checkout.js` globally; only
  `app/dashboard/patient/page.tsx` uses `window.Razorpay`.
- Fix: load the script on demand in `handlePay()` (inject the tag then open), or `next/script`
  with `lazyOnload` on the dashboard. Not a line saving — a ~30KB third-party script off the
  marketing site's critical path.

### C2. Messages chat polls every 3s and re-runs a write each time
- `app/messages/MessagesContent.tsx:63` `setInterval(fetchMessages, 3000)`; every poll hits
  `GET /api/messages?with=X`, whose handler runs `updateMany` marking messages read
  (`app/api/messages/route.ts:31-34`) — a database write every 3 seconds per open chat, even
  when nothing changed.
- Fix: only mark read when the fetch actually returned unread messages (or poll on visibility
  with backoff). SQLite writes serialize; this is pure waste at any scale.

### C3. `prisma` CLI in production dependencies
- `package.json:25` ships the Prisma CLI to production; it is a build/migration tool.
- Fix: move to `devDependencies`. The Docker image installs dev deps at build time, so
  `prisma db push` at runtime still works. −0 lines, smaller production install.

### C4. Dead CSS class
- `components/sections/Hero.tsx` uses `className="fade-in"` but `styles/globals.css` defines no
  `.fade-in` rule; the animation works entirely through the inline `style.opacity` set in JS.
- Fix: drop the class name (and consider reusing `useReveal` + `.reveal` instead of the bespoke
  timeout animation — that is a behavior change, so optional).

---

## D. Dependencies

### D1. `@types/bcryptjs` — redundant (−1 dependency)
- `bcryptjs@3` ships its own types (`node_modules/bcryptjs/index.d.ts` exists). The DefinitelyTyped
  package targets the old v2 API.

### D2. `decap-server` + `local_backend: true` — verify then delete (−1 dependency, −1 override)
- `decap-server` appears in no script, test, or source (grep). `app/admin/config.yml/route.ts:13`
  sets `local_backend: true`, which makes the CMS look for a local proxy on :8080 — next to the
  GitHub backend on the same page. If nobody runs `npx decap-server` by hand for local content
  editing, delete both the devDependency and the `local_backend` line (and then the
  `overrides.simple-git` pin in `package.json:55-57`, which exists for decap-server's transitive
  deps — verify with `npm ls simple-git` first).

### Keep (checked, in use): `jose` (JWT), `bcryptjs` (hashing), `gray-matter` (blog frontmatter),
`react-markdown` (blog render), `razorpay` (SDK), `@vercel/analytics` (`app/layout.tsx:49`),
`axe-core` (`test/accessibility/a11y.test.tsx`), vite/vitest/jsdom/testing-library (test stack).
`@axe-core/react` (devDependency) is referenced only in old audit prose — the a11y test imports
`axe-core` directly; candidate for deletion on the next dependency pass.

---

## E. Repo/config hygiene

- E1. `.gitignore` misses `.logs/`, `.vitest/`, `test-results/`, `.opencode/` (see A5).
- E2. `vitest.config.ts:16` — `exclude: ["tests/**/*.spec.ts"]` **replaces** vitest's defaults
  instead of extending them, so the runner executes 350+ test files from `node_modules`
  (36 "failing" dependency files, ~4.5 min suite). Fix:
  `exclude: ["tests/**/*.spec.ts", ...configDefaults.exclude]`. Biggest quality-of-life win in
  the repo; also makes `npm run test:coverage` feasible again (it currently times out).
- E3. README drift: says Node 18+ (Next 16 requires 20+), env-var list omits `AUTH_SECRET`,
  `CMS_ADMIN_USER/PASS`, `RAZORPAY_WEBHOOK_SECRET`, `DATABASE_URL` deployment choice; describes
  only the marketing site — the patient/clinician portal, payments and messaging are undocumented.
- E4. `public/admin/index.html` loads Decap from unpkg CDN without SRI. Admin-gated by basic
  auth, so low risk; pinning a version + integrity hash is the full fix, or self-host the SPA.
- E5. WhatsApp number `+91-8879997299` hardcoded in 5 places (`ContactSection.tsx:76`,
  `MessagesContent.tsx:178`, `BookingForm.tsx:113`, `JsonLd.tsx:10`, privacy fallback) while
  `content/contact.json` is CMS-managed. Route hrefs through the content layer or accept the drift.
- E6. `components/JsonLd.tsx` hardcodes phone/hours/address that CMS JSON owns — same class of
  drift as E5; include when touching JsonLd.

---

## F. Checked and deliberately NOT lean (decisions, not findings)

- `lib/events.ts:1` `ponytail:` comment names its in-memory limit — decision, but the expected
  deploy (multi-instance Vercel) already crosses it; revisit with finding "two deploy stories".
- `lib/razorpay.ts:3` singleton `ponytail:` comment — fine.
- `app/api/auth/route.ts:3`, `app/admin/route.ts:1`, `app/api/bookings/route.ts:79`,
  `app/sitemap.ts:4`, `hooks/useReveal.ts:1`, `hooks/useSSE.ts:35`, `components/JsonLd.tsx:1`,
  `app/api/events/route.ts:46` — marked shortcuts; each names its limit; none crossed at clinic
  scale except the events one (above).
- Register page offers a "clinician" role button that the API always rejects with 403
  (`app/api/auth/register/route.ts:32-34`). It is intentional (admin creates clinicians), but the
  button is a dead-end UX; product call, not a lean call.
- No password-reset flow exists; "Forgot password?" links to /contact. Product gap, not lean.
- SQLite + Docker volume, `staleTimes` 90 days, Basic auth on /admin, native `<dialog>` lightbox
  in `GallerySection` (good — platform over dependency), `robots.ts`/`sitemap.ts` (clean).
- Two test dirs (`test/` vitest, `tests/` Playwright) is intentional and configured correctly.

---

## Suggested order

1. E2 (fix the vitest exclude — unblocks testing everything else)
2. A1 (delete CSRF layer — restores bookings/notes/messages)
3. A2 + A4 (delete the SSE stack and dead helpers)
4. B1 + B2 (merge the crypto/cookie duplicates while touching auth)
5. A6 (delete CMS fallback copies after wiring the homepage contact content)
6. The rest in any order; D2 and E3 with the next dependency/docs pass.
