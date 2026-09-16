# Cloudflare Workers Deployment — Task List

Goal: Deploy Mindscaping to Cloudflare Workers for free.
Stack: Next.js 16, Prisma + SQLite → Postgres, Razorpay, JWT auth.

---

## Phase 1: Database Migration (SQLite → Postgres)

### Task 1.1 — Set up Neon Postgres (free tier)
- [ ] Create account at neon.tech
- [ ] Create a project (pick region closest to India for Razorpay latency)
- [ ] Copy the connection string (format: `postgresql://user:pass@host/dbname?sslmode=require`)
- [ ] Store connection string securely (do NOT commit to git)

### Task 1.2 — Update Prisma schema for Postgres
- [ ] In `prisma/schema.prisma`, change `provider = "sqlite"` → `provider = "postgresql"`
- [ ] Run `npx prisma generate` to regenerate client
- [ ] Run `npx prisma db push` (or `migrate dev`) against Neon to create tables
- [ ] Verify all 5 models (User, Session, Note, Message, Payment) exist in Neon dashboard

### Task 1.3 — Seed data (if needed)
- [ ] Create `prisma/seed.ts` if test data is needed
- [ ] Run `npx prisma db seed` against Neon

### Task 1.4 — Update .env
- [ ] Change `DATABASE_URL` from `file:./dev.db` to the Neon connection string
- [ ] Keep local SQLite working for `next dev` by using `.env.local` with the file URL
- [ ] Ensure `.env` (for production/deploy) points to Neon

---

## Phase 2: Cloudflare Workers Setup

### Task 2.1 — Install OpenNext adapter
- [ ] `npm install @opennextjs/cloudflare`
- [ ] Add to `package.json` scripts: `"deploy": "npx @opennextjs/cloudflare"`

### Task 2.2 — Create Cloudflare config
- [ ] Create `wrangler.toml` (or `wrangler.json`) at project root:
  ```toml
  name = "mindscaping"
  main = ".open-next/worker.js"
  compatibility_date = "2024-09-23"
  compatibility_flags = ["nodejs_compat"]

  [site]
  bucket = ".open-next/assets"
  ```
- [ ] Enable `nodejs_compat` compatibility flag (required for Prisma + Next.js)

### Task 2.3 — Build configuration
- [ ] Create `open-next.config.ts` at project root:
  ```ts
  import { defineCloudflareConfig } from "@opennextjs/cloudflare";
  export default defineCloudflareConfig({});
  ```
- [ ] Test build locally: `npx @opennextjs/cloudflare`
- [ ] Verify `.open-next/` directory is created with `worker.js` and `assets/`

### Task 2.4 — Handle image optimization
- [ ] Option A: Use `next/image` with `unoptimized: true` in `next.config.ts` (simplest)
- [ ] Option B: Set up Cloudflare Images (requires Cloudflare account, free for <25k images/mo)
- [ ] Update `next.config.ts` accordingly

---

## Phase 3: Environment Variables & Secrets

### Task 3.1 — Set Cloudflare Worker secrets
- [ ] `npx wrangler secret put DATABASE_URL` — paste Neon connection string
- [ ] `npx wrangler secret put AUTH_SECRET` — paste JWT secret
- [ ] `npx wrangler secret put RAZORPAY_KEY_ID`
- [ ] `npx wrangler secret put RAZORPAY_KEY_SECRET`
- [ ] `npx wrangler secret put REVALIDATION_SECRET`
- [ ] `npx wrangler secret put GITHUB_CLIENT_ID`
- [ ] `npx wrangler secret put GITHUB_CLIENT_SECRET`

### Task 3.2 — Set public env vars in wrangler.toml
- [ ] Add `[vars]` section for non-secret public vars:
  ```toml
  [vars]
  NEXT_PUBLIC_RAZORPAY_KEY_ID = "rzp_xxx"
  ```

---

## Phase 4: Razorpay Webhooks

### Task 4.1 — Verify webhook endpoint
- [ ] Razorpay webhook URL will be: `https://mindscaping.<your-subdomain>.workers.dev/api/payments/callback`
- [ ] Or configure a custom domain first (Phase 5) and use that
- [ ] Test webhook delivery in Razorpay dashboard

### Task 4.2 — Ensure callback route works on Workers
- [ ] Check `app/api/payments/callback/route.ts` — should be fine since it's a standard Next.js API route
- [ ] Verify Prisma calls in the callback work against Neon (not SQLite)

---

## Phase 5: Custom Domain

### Task 5.1 — Add domain to Cloudflare
- [ ] If domain is already on Cloudflare DNS: just add a route in `wrangler.toml`
- [ ] If not: either transfer nameservers to Cloudflare (free) OR use `npx wrangler pages deploy` with manual DNS
- [ ] For Workers routes: add to `wrangler.toml`:
  ```toml
  routes = [
    { pattern = "mindscaping.yourdomain.com", zone_name = "yourdomain.com" }
  ]
  ```

### Task 5.2 — SSL/TLS
- [ ] Cloudflare provides free SSL automatically for domains on their DNS
- [ ] Ensure "Full (strict)" SSL mode in Cloudflare dashboard

---

## Phase 6: Deploy & Verify

### Task 6.1 — First deploy
- [ ] Run `npx @opennextjs/cloudflare`
- [ ] Run `npx wrangler deploy`
- [ ] Check the `.workers.dev` URL loads correctly

### Task 6.2 — Smoke test
- [ ] Home page loads
- [ ] Login/register works (JWT auth against Neon)
- [ ] Dashboard renders
- [ ] Booking flow works
- [ ] Payment (Razorpay) creates order and callback succeeds
- [ ] Messages send/receive
- [ ] Notes CRUD works
- [ ] Admin panel accessible

### Task 6.3 — Performance check
- [ ] Cold start time (should be <3ms on Workers)
- [ ] Compare to Vercel/Render response times
- [ ] Verify no SQLite errors in logs

---

## Known Gotchas

1. **Prisma + Workers**: Prisma needs `nodejs_compat` flag. Without it, Prisma Client won't load.
2. **Connection pooling**: Neon has built-in connection pooling. No need for PgBouncer. Use the connection string as-is.
3. **ISR**: Cloudflare Workers via OpenNext supports ISR with KV caching. Add `[kv_cache]` binding in `wrangler.toml` if ISR is used.
4. **`next/image`**: Default Vercel optimizer won't work. Must use `unoptimized: true` or Cloudflare Images.
5. **`staleTimes`**: The current config sets 91-day stale times. This is aggressive for SSR — verify it doesn't cause stale data issues with Neon.
6. **`postinstall` script**: `"prisma skills sync || exit 0"` — verify this doesn't fail on Cloudflare's build environment.

---

## Rollback Plan

If Cloudflare deployment fails:
1. Keep Neon Postgres running (it's free regardless)
2. Fall back to Render (free tier) with the same Neon DB
3. Render supports Prisma+Postgres natively, no adapter needed
