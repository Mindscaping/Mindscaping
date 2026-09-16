# Free Hosting Options for Next.js 16 + Prisma

Research date: 2026-09-15

## TL;DR

| Platform | Truly Free? | Next.js SSR | Prisma | Custom Domain | Best For |
|----------|-------------|-------------|--------|---------------|----------|
| Vercel Hobby | Yes (personal only) | ✅ Full | ✅ Yes | ✅ Yes | Personal projects, best DX |
| Cloudflare Workers | Yes | ✅ Full (via OpenNext) | ⚠️ D1 only | ✅ Yes | Edge-first, generous limits |
| Deno Deploy | Yes | ✅ Full | ⚠️ Limited | ✅ Yes | Simple deploys |
| Netlify | Yes (300 credits) | ✅ Full (via OpenNext) | ⚠️ Postgres only | ✅ Yes | JAMstack + functions |
| Render | Yes (with spin-down) | ✅ Full | ✅ Yes | ✅ Yes | Full-stack with DB |
| Railway | $5/mo min | ✅ Full | ✅ Yes | ✅ Yes | Full-stack, multiple services |
| Fly.io | Trial only (7d) | ✅ Full | ✅ Yes | ✅ Yes | Custom infrastructure |
| Cyclic | ❌ SHUT DOWN | — | — | — | Dead (May 2024) |

---

## 1. Vercel (Hobby Plan)

**Price:** Free forever (personal, non-commercial use only)

**Free tier limits:**
- 100 GB bandwidth/month
- 4 CPU-hours serverless functions
- 360 GB-hrs provisioned memory
- 1M function invocations/month
- 100k config reads, 100 config writes
- 1 concurrent build

**Next.js support:** ✅ Native — this is Vercel's own framework. Full SSR, ISR, SSG, App Router, Server Actions, Middleware, everything.

**Prisma compatibility:** ✅ Works with any Prisma-supported DB (Postgres, MySQL, SQLite for dev). Serverless functions connect to your DB at runtime.

**Custom domain:** ✅ Free with automatic SSL.

**Gotchas:**
- **Non-commercial use only.** Can't use for business, clients, or anything revenue-generating.
- Per-organization billing means private repos in orgs cost $20/mo Pro.
- If your team has multiple members, Hobby is solo-only.
- Hard usage limits — exceeds 4 CPU-hrs and you're paused until next month.

**Verdict:** Best option for personal projects. The limitation is non-commercial use.

---

## 2. Cloudflare Pages/Workers

**Price:** Free (generous limits)

**Free tier limits:**
- 100,000 requests/day (Workers)
- 10 GB bandwidth/month (Pages)
- 10ms CPU time per request (Workers free)
- Unlimited static sites on Pages

**Next.js support:** ✅ Full via OpenNext adapter (`@opennextjs/cloudflare`) or `vinext`. Supports App Router, Pages Router, SSR, ISR, SSG, Server Actions, React Server Components, Middleware, response streaming.

**Prisma compatibility:** ⚠️ **Problematic.** Prisma uses Node.js filesystem APIs for SQLite. On Cloudflare Workers, you'd need to use Cloudflare D1 (SQLite-compatible edge DB) with Prisma's D1 adapter, or switch to a cloud DB (Postgres via Neon/Supabase). Standard Prisma with SQLite won't work on Workers.

**Custom domain:** ✅ Free with SSL.

**Gotchas:**
- Need `nodejs_compat` flag enabled.
- No Node.js middleware (introduced in Next.js 15.2) yet supported.
- Image optimization requires Cloudflare Images setup.
- Prisma needs adapter rewrite for edge runtime — not a drop-in.
- `vinext` is the recommended path, not the older `@cloudflare/next-on-pages`.

**Verdict:** Excellent free tier, but Prisma+SQLite requires migration to D1 or a cloud Postgres. Good if you're open to that.

---

## 3. Deno Deploy

**Price:** Free (1M requests/month)

**Free tier limits:**
- 1 million requests/month
- 100 GB egress/month
- 15 CPU-hours/month
- 500 GiB-hours memory

**Next.js support:** ✅ Full — App Router, Pages Router, ISR, SSG, SSR, PPR, `"use cache"`. Builds in standalone mode automatically. Deno's Node/npm compatibility layer handles most Next.js apps.

**Prisma compatibility:** ⚠️ Limited. Prisma works via Deno's npm compat layer, but SQLite may have issues. Cloud Postgres (Neon, Supabase) is the safer bet.

**Custom domain:** ✅ Yes.

**Gotchas:**
- Some Next.js versions crash during lint/type-check on Deno — workaround: set `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` in config.
- Client components calling browser-only hooks need `useEffect` deferral.
- Relatively new platform (GA Feb 2026), less battle-tested.

**Verdict:** Good free tier with generous request limits. Prisma works best with cloud Postgres.

---

## 4. Netlify

**Price:** Free (300 credits/month)

**Free tier limits:**
- 300 credits/month (hard limit, no recharge)
- Each credit covers: 15 credits per production deploy, 10 credits per GB-hour compute, 20 credits per GB bandwidth, 2 credits per 10k requests
- 1 concurrent build
- 500 project limit

**Next.js support:** ✅ Full via OpenNext adapter. App Router, SSR, ISR, SSG, Server Actions, Middleware, Image Optimization, all supported zero-config.

**Prisma compatibility:** ⚠️ Netlify Functions run on AWS Lambda. Prisma works, but SQLite has the same issue — needs persistent disk. Netlify Database (Postgres) is available but counts against credits.

**Custom domain:** ✅ Free with SSL.

**Gotchas:**
- 300 credits burn fast: ~20 deploys + some traffic uses it up.
- Netlify Database (Postgres) available but compute/bandwidth consume credits.
- 1 concurrent build limits CI speed.
- Preview deploys unlimited (doesn't count against credits).

**Verdict:** Works but credits are tight for active development. Better for static/JAMstack sites.

---

## 5. Render

**Price:** Free (with spin-down)

**Free tier limits:**
- 0.1 CPU, 512 MB RAM
- 750 free instance hours/month
- **Spins down after 15 minutes of no traffic** — takes ~1 minute to cold-start
- Free Postgres database (256 MB RAM, 30-day limit on free DB)
- Custom domains supported

**Next.js support:** ✅ Full. Deploy as a Web Service running `next start`. Supports SSR, ISR, API routes, all standard features.

**Prisma compatibility:** ✅ Yes — Render provides persistent storage. Can run Prisma with SQLite (file-based) or Postgres (free tier available).

**Custom domain:** ✅ Free with managed TLS.

**Gotchas:**
- **Spin-down is painful.** 15-min idle timeout means cold starts for users. Not suitable for anything requiring consistent response times.
- Free Postgres DB has 30-day limit (gets deleted).
- 0.1 CPU is very constrained — builds are slow.
- Free web services can't receive private network traffic.
- May restart free services at any time.

**Verdict:** Only realistic option with free Prisma+SQLite support, but spin-down makes it unsuitable for anything beyond dev/staging.

---

## 6. Railway

**Price:** $5/month minimum (Hobby plan with $5 credit)

**Free tier limits:**
- **No free tier.** $5/mo Hobby plan includes $5 usage credit.
- Usage-based: ~8 vCPU-hours, ~32 GB-hours memory within credit.
- 100 GB egress included.
- Solo team only.

**Next.js support:** ✅ Full. Docker-based, supports any Node.js app. App Router, SSR, API routes, all good.

**Prisma compatibility:** ✅ Excellent. Can run Postgres/Redis as separate services. Supports `prisma migrate deploy` as pre-deploy hook. Works with SQLite if you add a volume.

**Custom domain:** ✅ Yes.

**Gotchas:**
- **Not free.** $5/mo minimum even if usage is zero.
- Credit math: a small Next.js + Postgres easily exceeds the $5 credit, costing $10-20/mo.
- No truly free option for dev/staging.
- Good DX with private networking between services.

**Verdict:** Great for full-stack apps, but costs $5/mo minimum. Not a free option.

---

## 7. Fly.io

**Price:** Free trial only (7 days or 2 hours, whichever first)

**Free tier limits (trial):**
- 2 hours machine runtime OR 7 days access
- 10 machines max
- 20 GB volume storage
- No dedicated IPv4

**After trial (paid):**
- 3 shared-CPU-1x machines (256MB RAM) free
- 3 GB persistent storage free
- 160 GB egress free
- Shared IPv6 free, IPv4 costs $2/mo per app

**Next.js support:** ✅ Full. Docker-based, supports any framework.

**Prisma compatibility:** ✅ Full. Can run Postgres as a Fly app, SQLite works with persistent volumes.

**Custom domain:** ✅ Yes (free SSL via Let's Encrypt).

**Gotchas:**
- **Trial is very short.** 2 hours of runtime is nothing for development.
- After trial, need credit card. IPv4 costs $2/mo per app.
- Realistic cost for a running app: $15-20/mo.
- Free allowances shared across org, not per project.
- More complex than other options (Docker, fly.toml config).

**Verdict:** Not free. Trial is too short for meaningful development. Better for production workloads.

---

## 8. Cyclic.sh

**Status:** ❌ **SHUT DOWN** (May 2024). Free tier ended May 10, 2024. Paid tier ended May 31, 2024. New signups disabled. **Not an option.**

---

## 9. Other Notable Options

### Supabase (Database + Hosting)
- Free Postgres database (500 MB storage, 1 GB bandwidth)
- Supabase Auth, Storage, Edge Functions
- Pair with Vercel/Netlify for the frontend
- Good for the Prisma side if using Postgres

### Neon (Serverless Postgres)
- Free tier: 0.5 GB storage, 24/7 compute (with limits)
- Serverless branching, scales to zero
- Works great with Prisma as a cloud DB alternative to SQLite

### PlanetScale / Turso
- **PlanetScale:** Free tier discontinued. MySQL only anyway.
- **Turso:** Free tier (500 DBs, 9 GB storage). SQLite edge DB. Good Prisma compatibility via `@prisma/adapter-libsql`.

---

## Recommendation for Development

**For local dev with SQLite:** Keep using `next dev` locally with SQLite. No need to change anything.

**For deployment during development:**
1. **Vercel Hobby** — Best option if personal/non-commercial. Zero config, great DX.
2. **Cloudflare Workers** — If you're okay migrating from SQLite to D1 or a cloud Postgres. Most generous free tier.
3. **Deno Deploy** — Simple, fast deploys. Good for preview/demo environments.
4. **Render** — If you need SQLite in production and can tolerate spin-down (dev/staging only).

**Avoid for free hosting:**
- Railway ($5/mo minimum)
- Fly.io (trial too short)
- Cyclic (dead)
