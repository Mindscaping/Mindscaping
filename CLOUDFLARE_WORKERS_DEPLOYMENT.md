# Cloudflare Workers Deployment Guide — Mindscaping

> Next.js 16 + Prisma + React 19 on Cloudflare's edge runtime via OpenNext.

---

## Table of Contents

1. [Architecture Decision](#1-architecture-decision)
2. [Prisma Compatibility](#2-prisma-compatibility)
3. [Wrangler Configuration](#3-wrangler-configuration)
4. [API Route Adaptations](#4-api-route-adaptations)
5. [Step-by-Step Deployment Guide](#5-step-by-step-deployment-guide)
6. [Limitations and Gotchas](#6-limitations-and-gotchas)
7. [Cost Estimate](#7-cost-estimate)

---

## 1. Architecture Decision

### Why Cloudflare Workers (not Pages)

| Feature | Cloudflare Pages | Cloudflare Workers |
|---|---|---|
| SSR / API Routes | **Not supported** — Pages only serves static exports | **Full support** via OpenNext adapter |
| Next.js App Router | Static export only (`output: 'export'`) | Full SSR, API routes, server actions |
| Edge runtime | N/A | Runs on `workerd` (Cloudflare's edge runtime) |
| Cold starts | N/A | ~0ms (V8 isolates, no container spin-up) |
| Prisma | N/A | Supported via driver adapters |

**Bottom line:** Mindscaping uses App Router with SSR, API routes for auth/bookings/payments, and server-side Prisma queries. Cloudflare Pages cannot run any of this. **Workers is the only option on Cloudflare.**

Cloudflare's own docs now recommend Workers over Pages for Next.js:

> "Do not use this guide [Pages static export] unless you have a specific use case for static exports. Cloudflare recommends using Workers to deploy your Next.js site."
> — [Cloudflare Pages docs](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site)

The adapter to use is **`@opennextjs/cloudflare`** (the successor to the deprecated `@cloudflare/next-on-pages`). It translates `next build` (standalone mode) output into a format compatible with the Workers runtime.

---

## 2. Prisma Compatibility

### SQLite does NOT work on Cloudflare Workers

Workers run in V8 isolates — **no filesystem, no native binaries**. The current `prisma/schema.prisma` uses:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // file:./dev.db
}
```

This breaks on Workers because:
- `file:./dev.db` requires filesystem access
- Prisma's SQLite engine uses native binaries (`libquery_engine`) that can't run in V8

### You must switch to one of:

| Option | Provider | Prisma Adapter | Best For |
|---|---|---|---|
| **Cloudflare D1** | SQLite on Cloudflare's edge | `@prisma/adapter-d1` | Staying in the Cloudflare ecosystem, zero-external-dependency |
| **Neon Postgres** | Serverless PostgreSQL | `@prisma/adapter-neon` | Full PostgreSQL features, branching |
| **Supabase Postgres** | PostgreSQL | `@prisma/adapter-pg` | If already using Supabase |
| **Prisma Postgres** | Managed PostgreSQL | `@prisma/extension-accelerate` | Managed by Prisma, simplest setup |

**Recommendation for Mindscaping:** **Cloudflare D1** — keeps everything in the Cloudflare ecosystem, has a generous free tier, and the schema only uses basic SQLite-compatible types (no PostgreSQL-specific features like arrays or enums).

### Migration Steps

#### 1. Install the D1 adapter

```bash
npm install @prisma/adapter-d1
```

#### 2. Update `prisma/schema.prisma`

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"  // D1 is SQLite-compatible, keep this
  url      = env("DATABASE_URL")
}
```

The schema models (User, Session, Note, Message, Payment) use only basic types — no changes needed to any model definitions.

#### 3. Rewrite `lib/db.ts`

The current singleton pattern doesn't work on Workers (each request gets a fresh isolate). You need to instantiate Prisma with the D1 adapter per request:

```typescript
// lib/db.ts — Cloudflare Workers version
import { PrismaClient } from "@/src/generated/prisma";
import { PrismaD1 } from "@prisma/adapter-d1";

export function createPrismaClient(env: { DB: D1Database }) {
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}
```

**But this changes every file that imports `prisma` directly.** A compatibility shim that works in both dev (Node.js with SQLite) and production (Workers with D1):

```typescript
// lib/db.ts — works in both dev and Workers
import { PrismaClient } from "@prisma/client";

// In Cloudflare Workers, env is passed from the fetch handler
let d1Adapter: unknown = null;

export function setD1Adapter(adapter: unknown) {
  d1Adapter = adapter;
}

export function getPrisma(env?: { DB: D1Database }) {
  if (env?.DB) {
    // Production: use D1 adapter
    const { PrismaD1 } = require("@prisma/adapter-d1");
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter });
  }
  if (d1Adapter) {
    // Workers context
    const { PrismaD1 } = require("@prisma/adapter-d1");
    const adapter = new PrismaD1(d1Adapter);
    return new PrismaClient({ adapter });
  }
  // Dev: standard Node.js PrismaClient with SQLite
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
  return globalForPrisma.prisma || new PrismaClient();
}
```

**Practical approach:** Since every API route needs access to the env bindings, the cleanest pattern for OpenNext is to pass `env` through a shared context. The [Prisma D1 docs](https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm/) recommend instantiating per-request.

#### 4. Generate SQL migrations for D1

D1 uses SQLite, so your existing Prisma schema is compatible. Export the SQL and apply it:

```bash
# Generate the SQL migration
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/schema.sql

# Apply to local D1
npx wrangler d1 execute mindscaping-db --file=prisma/schema.sql --local

# Apply to remote D1
npx wrangler d1 execute mindscaping-db --file=prisma/schema.sql --remote
```

---

## 3. Wrangler Configuration

### Install dependencies

```bash
npm install @opennextjs/cloudflare@latest
npm install -D wrangler@latest
```

### Create `wrangler.jsonc` (or `wrangler.toml`)

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "mindscaping",
  "compatibility_date": "2026-09-15",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "mindscaping-db",
      "database_id": "<YOUR_D1_DATABASE_ID>"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "NEXT_CACHE_WORKERS_KV",
      "id": "<YOUR_KV_NAMESPACE_ID>"
    }
  ]
}
```

Key points:
- **`nodejs_compat`** — required for Prisma, jose, bcryptjs to work
- **`compatibility_date`** — set to today's date
- **`d1_databases`** — create with `wrangler d1 create mindscaping-db`
- **`kv_namespaces`** — create with `wrangler kv namespace create NEXT_CACHE_WORKERS_KV` (used by OpenNext for ISR/page cache)

### Update `package.json` scripts

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:worker": "opennextjs-cloudflare build",
    "preview:worker": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
  }
}
```

### `open-next.config.ts` (auto-generated on first build)

OpenNext generates this automatically. If you need to customize it:

```typescript
// open-next.config.ts
const config = {
  // OpenNext auto-detects your Next.js config
};
export default config;
```

---

## 4. API Route Adaptations

### 4.1 Filesystem Access — `lib/team-sync.ts`

This is the **critical breaking change**. The current code:

```typescript
import { readFileSync } from "fs";
import { join } from "path";

export function getTeamData(): CMSMember[] {
  const raw = readFileSync(join(process.cwd(), "content", "team.json"), "utf-8");
  return JSON.parse(raw);
}
```

Workers have **no filesystem**. Three solutions:

#### Option A: Bundle the JSON at build time (simplest, recommended)

Since `content/team.json` is static CMS content that rarely changes:

```typescript
// lib/team-sync.ts — Cloudflare Workers version
import teamData from "@/content/team.json";
import { prisma } from "./db";

export function getTeamData(): CMSMember[] {
  return teamData as CMSMember[];
}
```

Import the JSON directly — bundlers (webpack/turbopack) inline it at build time. Zero filesystem access at runtime.

#### Option B: Use Workers KV for dynamic content

If team data changes frequently and you want to avoid rebuilds:

```typescript
export async function getTeamData(env: { TEAM_KV: KVNamespace }): Promise<CMSMember[]> {
  const raw = await env.TEAM_KV.get("team-data", "json");
  return (raw as CMSMember[]) || [];
}
```

Update via `wrangler kv:key put --binding=TEAM_KV "team-data" "$(cat content/team.json)"`.

#### Option C: Use D1

Store team members in D1 and query them. Overkill for static content.

**Recommendation:** Option A. The team data is content-managed and changes infrequently. A rebuild on content push is fine.

### 4.2 Node.js Module Compatibility

| Module | Works on Workers? | Status |
|---|---|---|
| `jose` (JWT) | Yes | Pure JS, no issues |
| `bcryptjs` | Yes | Pure JS implementation, works fine |
| `gray-matter` | Yes | Pure JS |
| `razorpay` | Check | Uses `axios` internally — needs `nodejs_compat` flag |
| `react-markdown` | Yes | Pure JS |
| `next/headers` (`cookies()`) | Yes | Polyfilled by OpenNext |
| `fs`, `path` | **No** | Must remove or replace (see team-sync above) |
| `revalidatePath` | Partial | Works but uses KV cache instead of filesystem |

### 4.3 Revalidation Route

The `/api/revalidate` route uses `revalidatePath` from `next/cache`. On Workers, OpenNext routes this through KV cache invalidation. The route itself should work as-is — no code changes needed.

### 4.4 Razorpay Webhook

The Razorpay webhook at `/api/payments/webhook` reads the raw body for signature verification. Current code parses JSON directly without verifying the signature (marked with `ponytail: verify webhook signature in production`). On Workers, `req.json()` works the same way — no changes needed.

### 4.5 NextRequest/NextResponse Compatibility

All routes use `NextRequest` and `NextResponse` from `next/server`. These are fully supported by OpenNext on Workers. No changes needed.

---

## 5. Step-by-Step Deployment Guide

### Prerequisites

```bash
# Install wrangler CLI globally
npm install -g wrangler@latest

# Authenticate with Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### Step 1: Create D1 Database

```bash
# Create the database
wrangler d1 create mindscaping-db

# Copy the output — you'll need the database_id for wrangler.jsonc
# Example output:
# ✅ Successfully created DB 'mindscaping-db' in region WEUR
# database_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step 2: Create KV Namespace (for cache)

```bash
wrangler kv namespace create NEXT_CACHE_WORKERS_KV

# Copy the id from output
```

### Step 3: Create `.dev.vars` (local secrets)

Cloudflare Workers use `.dev.vars` instead of `.env` for local development:

```bash
# Rename or copy .env to .dev.vars
cp .env .dev.vars
```

The `.dev.vars` file:

```bash
AUTH_SECRET=your-auth-secret-here
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
REVALIDATION_SECRET=your-secret-here
DATABASE_URL="file:./dev.db"  # Still used locally for prisma
```

### Step 4: Install OpenNext and Configure

```bash
npm install @opennextjs/cloudflare@latest
npm install -D wrangler@latest
```

Create `wrangler.jsonc` with the D1 and KV bindings (see [Section 3](#3-wrangler-configuration)).

### Step 5: Update `lib/db.ts` and `lib/team-sync.ts`

Apply the changes described in [Section 2](#2-prisma-compatibility) and [Section 4.1](#41-filesystem-access--libteam-syncts).

### Step 6: Apply Database Schema to D1

```bash
# Export schema as SQL
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/schema.sql

# Apply to local D1 (for testing)
wrangler d1 execute mindscaping-db --file=prisma/schema.sql --local

# Apply to remote D1
wrangler d1 execute mindscaping-db --file=prisma/schema.sql --remote
```

### Step 7: Seed D1 with Initial Data

```bash
# Create a seed script that uses wrangler
wrangler d1 execute mindscaping-db --command "INSERT INTO User (id, email, passwordHash, name, role) VALUES ('...', 'admin@mindscaping.com', '...', 'Admin', 'clinician')" --remote

# Or use a SQL seed file
wrangler d1 execute mindscaping-db --file=prisma/seed.sql --remote
```

### Step 8: Set Environment Variables (Production)

```bash
# Secrets (encrypted, never in wrangler.toml)
wrangler secret put AUTH_SECRET
wrangler secret put RAZORPAY_KEY_ID
wrangler secret put RAZORPAY_KEY_SECRET
wrangler secret put REVALIDATION_SECRET
wrangler secret put DATABASE_URL  # Not needed if using D1 binding directly

# Public env vars go in next.config.ts or wrangler.toml [vars]
```

### Step 9: Build and Preview Locally

```bash
# Build for Workers
npm run build:worker

# Preview in local Workers runtime
npm run preview:worker
# Opens at http://localhost:8787
```

### Step 10: Deploy

```bash
# Deploy to Cloudflare
npm run deploy

# Or directly:
opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

Output will include your Workers URL: `https://mindscaping.<your-subdomain>.workers.dev`

### Step 11: Custom Domain

1. Go to Cloudflare Dashboard → Workers & Pages → mindscaping → Settings → Triggers
2. Add a Custom Domain or Route
3. For `mindscaping.in`:
   - Add domain `mindscaping.in`
   - Add domain `www.mindscaping.in`
4. Update DNS records (if domain is on Cloudflare, this is automatic)
5. SSL/TLS is automatic

---

## 6. Limitations and Gotchas

### 6.1 CPU Time Limits

| Plan | CPU Time per Request | Wall Clock Time |
|---|---|---|
| **Free** | 10 ms | No hard limit (while client connected) |
| **Paid** ($5/mo) | 30 seconds (configurable up to 5 min) | No hard limit |

**What counts as CPU time:** Executing JavaScript, JSON parsing, cryptographic operations (bcrypt).

**What does NOT count:** Waiting on network requests (fetch, D1 queries, KV reads), `setTimeout`, idle time.

**Impact on Mindscaping:**
- Login route: bcrypt hash comparison uses ~5-10ms CPU — **fits in free tier**
- Payment creation: Razorpay API call is a subrequest (no CPU cost during wait) — **fits in free tier**
- SSR page renders: depends on complexity — **test with `wrangler dev`**

If you hit the 10ms limit, you'll get a `500` with a CPU time exceeded error. Upgrade to paid ($5/mo) for 30-second CPU budget.

### 6.2 No Node.js Native Modules

Workers use `workerd` (V8-based), not Node.js. The `nodejs_compat` flag polyfills many Node.js APIs, but not all:

| Module | Status |
|---|---|
| `fs` / `path` | **Not available** — must not be imported |
| `child_process` | **Not available** |
| `crypto` | Partial — use Web Crypto API or `nodejs_compat` polyfill |
| `buffer` | Available with `nodejs_compat` |
| `stream` | Available with `nodejs_compat` |
| `process` | Partial — `process.env` works, most others don't |

The current codebase imports `fs` and `path` only in `lib/team-sync.ts`. All other modules (`jose`, `bcryptjs`, `gray-matter`) are pure JS and work fine.

### 6.3 Cold Starts

V8 isolates have **near-zero cold starts** (~0ms) compared to Lambda/containers (100-500ms). This is a major advantage of Workers. There's no "warm up" needed.

### 6.4 WebSocket Limitations

Workers support WebSockets, but **Next.js server-sent events (SSE) and streaming responses** have caveats:
- Streaming works ( Responses can be streamed)
- Long-lived connections count against your concurrent connection limit
- No WebSocket support in `next dev` on Workers (use `npm run dev` for local Node.js dev, `npm run preview:worker` for Workers testing)

The Mindscaping app doesn't use WebSockets or SSE, so this isn't a concern.

### 6.5 D1 Limitations

| Feature | Free | Paid |
|---|---|---|
| Rows read | 5M/day | 50B/day |
| Rows written | 100K/day | 50M/day |
| Storage | 5 GB | 50 GB |
| D1 databases | 10 | 10K |
| Time travel queries | No | Yes |

For a therapy practice website, the free tier is more than sufficient.

### 6.6 ISR / Caching

OpenNext uses **Workers KV** for page cache (replacing Next.js filesystem cache). This means:
- `revalidatePath()` and `revalidateTag()` work via KV invalidation
- Cached pages are served from the nearest Cloudflare edge
- You must create the `NEXT_CACHE_WORKERS_KV` namespace (see Step 2)

### 6.7 Environment Variables

- **Secrets:** Use `wrangler secret put` — never commit to `wrangler.toml`
- **Public vars:** Can use `[vars]` in `wrangler.jsonc` or `NEXT_PUBLIC_*` in `.dev.vars`
- Workers do **not** read `.env` files at runtime — only `.dev.vars` for local dev

### 6.8 `process.cwd()` Behavior

In Workers, `process.cwd()` may not return what you expect. The `opennextjs-cloudflare` adapter handles this, but be cautious with any code that resolves paths relative to `process.cwd()`.

---

## 7. Cost Estimate

### Free Tier (good for launch / low traffic)

| Resource | Free Allowance | Notes |
|---|---|---|
| **Requests** | 100,000/day | ~3M/month |
| **CPU time** | 10ms per request | Enough for most SSR + auth |
| **Workers KV** | 100K reads/day, 1K writes/day | Cache for pages |
| **D1** | 5M rows read/day, 100K writes/day | Plenty for a practice site |
| **Bandwidth** | Unlimited | Cloudflare doesn't charge for bandwidth |
| **Custom domain** | Free | SSL included |

**Estimated cost for a therapy practice site with ~500 visitors/day:** $0

### Paid Tier ($5/month)

When you'd need to upgrade:
- **>100K requests/day** — more than ~3K unique visitors/day
- **CPU time >10ms** — complex SSR pages, bcrypt with high cost factor
- **D1 >5M reads/day** — heavy query loads
- **KV >100K reads/day** — high-traffic caching

The $5/month paid plan includes:
- 10M requests/month
- 30 million CPU-ms/month
- 5 min max CPU time per request
- 10K D1 databases

### Cost Breakdown Estimate

For a typical therapy practice site (low-medium traffic):

| Resource | Estimated Usage | Monthly Cost |
|---|---|---|
| Workers requests | ~15K/month | $0 (free tier) |
| Workers CPU | ~500K CPU-ms | $0 (free tier) |
| D1 reads | ~50K rows | $0 (free tier) |
| D1 writes | ~5K rows | $0 (free tier) |
| KV reads | ~10K | $0 (free tier) |
| Custom domain | 1 | $0 |
| **Total** | | **$0** |

### Upgrade Trigger Points

| Metric | Free Limit | Action |
|---|---|---|
| 100K requests/day | Hit ceiling | Upgrade to $5/mo paid |
| 10ms CPU per request | SSR timeouts | Upgrade to paid (30s CPU) |
| 5M D1 reads/day | Data-heavy queries | Review query patterns, then upgrade |

---

## Quick Reference: Files to Change

| File | Change Required | Why |
|---|---|---|
| `prisma/schema.prisma` | Add `previewFeatures = ["driverAdapters"]`, set `output` | Enable D1 driver adapter |
| `lib/db.ts` | Rewrite to accept env bindings | Workers don't use singleton pattern |
| `lib/team-sync.ts` | Import JSON directly instead of `readFileSync` | No filesystem on Workers |
| `package.json` | Add `@opennextjs/cloudflare`, wrangler, build scripts | Deployment tooling |
| `wrangler.jsonc` | **New file** — Workers config with D1/KV bindings | Workers runtime config |
| `.dev.vars` | **New file** — local secrets (rename from `.env`) | Workers local dev |
| `next.config.ts` | No changes needed | OpenNext handles config |
| API routes (`app/api/**`) | No changes needed | NextRequest/NextResponse work as-is |

---

## Further Reading

- [Cloudflare Workers + Next.js docs](https://developers.cloudflare.com/workers/framework-guides/nextjs)
- [OpenNext for Cloudflare](https://opennextjs.cloudflare.dev)
- [Prisma + D1 tutorial](https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm/)
- [Prisma + Cloudflare Workers guide](https://www.prisma.io/docs/guides/deployment/cloudflare-workers)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing)
