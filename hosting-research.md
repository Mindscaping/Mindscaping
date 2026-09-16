# Free Hosting Options for Mindscaping

## Platform Comparison

### Cloudflare Pages
- **Free tier**: 500 builds/month, unlimited requests
- **Next.js SSR**: Supported via Cloudflare Workers ($0 free tier)
- **Prisma**: NOT supported natively (no Node.js runtime). Requires adapter.
- **Custom domain**: Free
- **Gotcha**: Requires wrangler CLI and CF account. Serverless functions have 10ms CPU time limit on free.

### Railway
- **Free tier**: $5/month credit (approx 500 hours of hobby usage)
- **Next.js SSR**: Full support
- **Prisma**: Full support (SQLite/PostgreSQL)
- **Custom domain**: Free
- **Gotcha**: Free credit runs out monthly. Hobby plan $5/mo after. Good for dev.

### Render
- **Free tier**: Web services spin down after inactivity (cold starts ~30s)
- **Next.js SSR**: Full support
- **Prisma**: Full support (PostgreSQL free tier available)
- **Custom domain**: Free
- **Gotcha**: Free tier services sleep after 15 min inactivity. Good enough for dev/staging.

### Fly.io
- **Free tier**: 3 shared VMs (256MB), 3GB persistent volume
- **Next.js SSR**: Full support
- **Prisma**: Full support (SQLite on volume, or Postgres)
- **Custom domain**: Free
- **Gotcha**: Requires Dockerfile. Steeper learning curve. Generous free tier.

### Netlify
- **Free tier**: 100GB bandwidth, 300 build minutes
- **Next.js SSR**: Supported via Netlify Functions
- **Prisma**: Limited (serverless function constraints)
- **Custom domain**: Free
- **Gotcha**: Node.js function memory limit 1024MB on free tier.

## Recommendation
**Railway** or **Fly.io** for best dev experience with Prisma + Next.js. Railway is simplest (push-to-deploy). Fly.io is most generous free tier but requires Docker. **Render** is a good middle ground but cold starts are annoying.

For pure static preview: **Cloudflare Pages** or **Netlify** (without SSR/API routes).
For full-stack dev: **Railway** (easiest) or **Fly.io** (most free).
