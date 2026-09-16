# Mindscaping — Project Reference

## What
Mental health therapy practice website (Mumbai, India). CBT, DBT, trauma-informed, neurodivergent/queer-affirming support. Live at `https://mindscaping.in`.

## Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **UI:** React 19
- **Styling:** Tailwind CSS 4 (via PostCSS)
- **Fonts:** Cormorant Garamond (serif), Jost (sans) — Google Fonts
- **Blog parsing:** gray-matter (Markdown frontmatter)
- **CMS:** Decap CMS 3 (Git-based, GitHub backend)
- **Deployment:** Vercel

## Dependencies
**Runtime:** `next`, `react`, `react-dom`, `gray-matter`
**Dev:** `tailwindcss`, `@tailwindcss/postcss`, `typescript`, `eslint`, `eslint-config-next`, `@types/*`

## Data Flow
1. Content stored as JSON + Markdown in `content/`
2. `lib/content.ts` reads from filesystem at build time
3. Server components in `app/page.tsx` call content functions, pass as props
4. Client components render with `useReveal` for scroll animations
5. Decap CMS (`/admin/`) edits content via GitHub OAuth
6. GitHub webhook → `/api/revalidate` purges ISR cache

## Directory Structure
```
app/                    # Next.js App Router pages + API routes
  layout.tsx            # Root layout (fonts, Nav, Footer, metadata)
  page.tsx              # Homepage (all sections)
  not-found.tsx         # Custom 404
  sitemap.ts            # Dynamic sitemap
  robots.ts             # robots.txt
  admin/route.ts        # Redirect to Decap CMS
  api/auth/route.ts     # GitHub OAuth start
  api/callback/route.ts # GitHub OAuth callback
  api/revalidate/route.ts # ISR webhook
  blog/page.tsx         # Blog listing
  blog/[slug]/page.tsx  # Individual blog post
  contact/page.tsx
  faq/page.tsx
  gallery/page.tsx
  privacy/page.tsx
  team/page.tsx
components/
  JsonLd.tsx            # Schema.org structured data (Physician)
  blog/PostCard.tsx     # Blog post card
  layout/Nav.tsx        # Fixed navbar + mobile hamburger
  layout/Footer.tsx     # Site footer
  sections/             # 10 section components for homepage
content/                # CMS-managed content
  team.json             # 7 team members
  faq.json              # 6 FAQ entries
  testimonials.json     # 3 testimonials
  gallery.json          # 4 gallery images
  blog/                 # (empty — no posts yet)
hooks/
  useReveal.ts          # IntersectionObserver scroll-reveal
lib/
  content.ts            # Content access layer
public/
  admin/                # Decap CMS (index.html + config.yml)
  images/               # Team photos, gallery, logo
styles/
  globals.css           # Tailwind + brand colors + .reveal animation
```

## Routes
| Route | Description |
|-------|-------------|
| `/` | Homepage (all sections) |
| `/blog` | Blog listing |
| `/blog/[slug]` | Individual blog post |
| `/team` | Team page |
| `/gallery` | Photo gallery |
| `/faq` | FAQ accordion |
| `/contact` | Contact info + WhatsApp |
| `/privacy` | Privacy policy |
| `/admin` | Decap CMS |
| `/api/auth` | GitHub OAuth start |
| `/api/callback` | GitHub OAuth callback |
| `/api/revalidate` | ISR cache purge |

## Key Patterns
- **Content access:** All in `lib/content.ts` — `getTeamMembers()`, `getFaqs()`, `getTestimonials()`, `getGalleryImages()`, `getPosts()`, `getPost(slug)`, `getAllSlugs()`
- **Scroll animation:** `useReveal()` hook — IntersectionObserver on `.reveal` elements, adds `.visible` class
- **Brand colors:** Brown `#6b5b95`, offwhite `#f0eeff`, taupe `#8fa8c8`, light-taupe `#c3b8e8`, cream `#eef4ff`
- **SEO:** JSON-LD (Physician type), dynamic sitemap, robots.txt, OpenGraph metadata
- **Security headers:** X-Frame-Options, HSTS, nosniff, referrer-policy, permissions-policy (in `next.config.ts`)
- **ISR:** 90-day stale time for pages (aggressive caching)

## What's Not Built
- `content/blog/` directory doesn't exist — no blog posts created yet
- Blog listing falls back to external Blogspot link

## Notes for Future Edits
- All 10 homepage sections are in `components/sections/`
- Team data is hardcoded in `content/team.json` (7 members with photos)
- Gallery images are in `public/images/gallery-*.jpg`
- WhatsApp link: `wa.me/918879997299`
- UDYAM registration: UDYAM-MH-33-0518142
- Decap CMS config: `public/admin/config.yml` — 5 collections (team, faq, testimonials, gallery, blog)
