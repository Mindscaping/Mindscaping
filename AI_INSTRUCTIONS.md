# AI Instructions — Mindscaping

Context file for AI assistants working on this codebase. Read this before making any changes.

## Project Identity

Mindscaping is a mental health therapy practice website. It is a marketing/content site with a CMS backend for managing blog posts and static content. The business provides affordable, accessible psychological support (CBT, DBT, trauma-informed care, neurodivergent and queer-affirming) in Mumbai, India.

## Architecture

### Framework

Next.js 16 App Router with React 19. Server Components by default; client components are explicitly marked with `"use client"`.

### Content Layer

`lib/content.ts` is the single source of truth for all content. It reads JSON files from `content/` and Markdown from `content/blog/`. All content functions are synchronous (they use `fs.readFileSync`). Pages call these at the top level and pass data as props to client components.

### Component Pattern

- **Server Components** (no `"use client"`): page files in `app/`, `JsonLd.tsx`, `PostCard.tsx`
- **Client Components** (with `"use client"`): `Nav.tsx`, all `sections/*.tsx`, `useReveal.ts`
- Client components receive data as props from their parent server component
- No client-side data fetching — all data is loaded server-side in page components

### Styling

Tailwind CSS 4 with custom brand theme via CSS custom properties in `styles/globals.css`:
- `--brown` (#6b5b95) — primary brand color, used as `bg-brand-brown`, `text-brand-brown`
- `--offwhite` (#f0eeff) — background, used as `bg-brand-offwhite`, `text-brand-offwhite`
- `--taupe` (#8fa8c8) — accent, used as `text-brand-taupe`
- `--light-taupe` (#c3b8e8) — lighter accent
- `--cream` (#eef4ff) — section backgrounds

Fonts: Cormorant Garamond (serif) + Jost (sans-serif), loaded via `next/font/google` in `app/layout.tsx`.

### Scroll Reveal

`hooks/useReveal.ts` provides a shared IntersectionObserver-based scroll reveal. Components add `className="reveal"` to elements, which start hidden (opacity: 0, translateY: 24px) and animate in when scrolled into view. The hook also manages the `.visible` class.

### CMS

Decap CMS (self-hosted in `public/admin/`). Backend is GitHub — content changes commit directly to `main`. OAuth flow: `/api/auth` → GitHub → `/api/callback` → postMessage to Decap.

### SEO

- Dynamic `robots.txt` (`app/robots.ts`)
- Dynamic `sitemap.xml` (`app/sitemap.ts`)
- Schema.org JSON-LD for local business (`components/JsonLd.tsx`)
- OpenGraph/Twitter meta tags in `app/layout.tsx`

### Security Headers

Configured in `next.config.ts`: X-Frame-Options DENY, HSTS, nosniff, strict referrer policy, permissions policy (no camera/mic/geo).

## Conventions

### ponytail: Comments

The codebase uses `ponytail:` prefixed comments to mark deliberate simplification decisions. These are not TODOs — they document why a simple approach was chosen. Do not remove them.

### File Organization

- One component per file
- Components in `components/sections/` are homepage-only
- `app/*/page.tsx` files are thin wrappers that fetch data and render section components
- API routes in `app/api/` handle OAuth and ISR only

### Data Flow

```
app/page.tsx (server)
  → lib/content.ts (reads JSON/markdown)
  → passes data as props
  → components/sections/*.tsx (client, renders UI)
```

Never fetch data in client components. Always load at the page level.

## Testing

- **Framework:** Vitest + React Testing Library
- **Config:** `vitest.config.ts`
- **Setup:** `test/setup.ts`
- **Coverage:** v8 provider, 95% threshold on all metrics
- **Scope:** `components/**/*.tsx`, `hooks/**/*.ts`, `lib/**/*.ts`

### Running Tests

```bash
npm test              # Single run
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Test File Locations

- `test/lib/content.test.ts` — content loading (mocks fs)
- `test/hooks/useReveal.test.tsx` — IntersectionObserver hook
- `test/components/*.test.tsx` — component rendering and behavior

### Writing Tests

- Mock `next/image` and `next/link` in component tests
- Mock `IntersectionObserver` as a class (not a function) in `beforeEach`
- Use `fireEvent` from `@testing-library/react` for click interactions
- Use `vi.useFakeTimers()` when testing `useReveal` (it uses `setTimeout`)

## Known Limitations

1. **Blog content directory doesn't exist yet** — `content/blog/` needs to be created (via CMS or manually) before blog posts will appear.
2. **No booking system** — An OSS booking solution is planned but not yet integrated. Contact is currently via WhatsApp only.
3. **Grievance officer email is a placeholder** in `app/privacy/page.tsx` — needs a real email before production use.
4. **Footer has no copyright year** — intentional, per product decision.

## Security Notes

- Never log or expose `GITHUB_CLIENT_SECRET` or `REVALIDATION_SECRET`
- The revalidate webhook requires the `REVALIDATION_SECRET` for auth
- OAuth tokens are passed via postMessage — do not add additional token storage
- Security headers are set in `next.config.ts` — do not weaken them
