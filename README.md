# Mindscaping

Website for Mindscaping — a mental health therapy practice based in Mumbai, India. Built with Next.js (App Router), Decap CMS, and deployed on Vercel.

Production: [mindscaping.in](https://mindscaping.in)

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 with custom brand theme
- **CMS:** Decap CMS 3 (GitHub backend, OAuth for admin)
- **Content:** JSON files in `content/`, Markdown blog posts in `content/blog/`
- **Deployment:** Vercel with ISR (90-day stale times)
- **Testing:** Vitest + React Testing Library + v8 coverage

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```
GITHUB_CLIENT_ID=        # GitHub OAuth app client ID (for Decap CMS)
GITHUB_CLIENT_SECRET=    # GitHub OAuth app client secret
REVALIDATION_SECRET=     # Secret for ISR cache purge webhook
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & Start

```bash
npm run build
npm start
```

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Run with coverage report
```

Coverage thresholds: 95% across statements, branches, functions, and lines.

## Project Structure

```
app/                    # Next.js App Router pages
  admin/                # Redirect to Decap CMS
  api/                  # OAuth + ISR webhook
  blog/                 # Blog listing + [slug] pages
  contact/              # Contact page
  faq/                  # FAQ page
  gallery/              # Gallery page
  team/                 # Team page
  privacy/              # Privacy policy
components/
  blog/PostCard.tsx     # Blog post card
  layout/Nav.tsx        # Navigation bar
  layout/Footer.tsx     # Footer
  sections/             # Homepage section components
  JsonLd.tsx            # Schema.org structured data
content/                # CMS-managed JSON content
  team.json             # Team members
  faq.json              # FAQs
  testimonials.json     # Client testimonials
  gallery.json          # Gallery images
  blog/                 # Markdown blog posts (create via CMS)
hooks/useReveal.ts      # Shared scroll-reveal hook
lib/content.ts          # Content loading layer
public/admin/           # Decap CMS SPA + config
styles/globals.css      # Tailwind + brand theme
```

## Content Management

Content is managed via Decap CMS at `/admin`. Login requires GitHub OAuth (configured in `.env`).

### Collections

- **Team Members** — `content/team.json`
- **FAQs** — `content/faq.json`
- **Testimonials** — `content/testimonials.json`
- **Gallery** — `content/gallery.json`
- **Blog Posts** — `content/blog/*.md` (Markdown with frontmatter)

### Adding Blog Posts

1. Go to `/admin`
2. Click "Blog Posts" → "New Blog Post"
3. Fill in title, excerpt, published date, and body (Markdown)
4. Publish — pushes directly to `main` branch

### ISR Cache Purge

After content changes, purge the cache:

```bash
curl -X POST https://mindscaping.in/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_REVALIDATION_SECRET", "path": "/"}'
```

## AI Developer Context

For AI assistants working on this codebase, see [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) for project conventions, architecture decisions, and guidance.

## License

Proprietary. All rights reserved.
