# Tools App

`tools.toolrouteai.com` is the free AI tools and newsletter subscription engine for the one-person-company portfolio.

Current focus: free workflow tools that reuse the four-site content portfolio, collect newsletter subscribers, and run cheaply on Cloudflare Pages.

## Tools Available

- [Prompt Optimizer](https://tools.toolrouteai.com/prompt-optimizer): rewrites rough prompts into structured, model-ready instructions. Protected by Turnstile and KV-backed daily rate limits.
- [Comparison Builder](https://tools.toolrouteai.com/comparison): compares 2-5 tools from the four-site content index and exports Markdown or PDF. No LLM API call is used.
- [Obsidian Template Generator](https://tools.toolrouteai.com/obsidian-templates): generates Markdown, Dataview, and Templater-friendly Obsidian template packs with browser-side `.zip` export.
- [Price Tracker](https://tools.toolrouteai.com/price-tracker): tracks 50+ official AI tool pricing pages and shows verified price-change signals. Cron is intentionally disabled by default. RSS: [price-tracker/feed.xml](https://tools.toolrouteai.com/price-tracker/feed.xml), JSON: [price-tracker/index.json](https://tools.toolrouteai.com/price-tracker/index.json), changes: [price-tracker/changes.json](https://tools.toolrouteai.com/price-tracker/changes.json)
- [Side Hustle Ideas](https://tools.toolrouteai.com/side-hustle-ideas): generates three practical side-hustle ideas from a user's skill, weekly time, and starting budget. Protected by Turnstile and KV-backed daily rate limits.
- [Chinese landing page](https://tools.toolrouteai.com/zh-cn): localized entrypoint for the tools suite.
- [Health JSON](https://tools.toolrouteai.com/health.json): machine-readable status summary for tools, content indexes, SEO pages, and feeds.

Comparison index pages:

- [Midjourney vs DALL-E 3](https://tools.toolrouteai.com/comparison/midjourney-vs-dall-e-3)
- [Notion vs Obsidian](https://tools.toolrouteai.com/comparison/notion-vs-obsidian)
- [n8n vs Zapier](https://tools.toolrouteai.com/comparison/n8n-vs-zapier)
- [Zotero vs Mendeley](https://tools.toolrouteai.com/comparison/zotero-vs-mendeley)

Price Tracker index pages:

- [Free AI Tools](https://tools.toolrouteai.com/price-tracker/free-ai-tools)
- [Subscription AI Tools](https://tools.toolrouteai.com/price-tracker/subscription-ai-tools)
- [One-Time AI Tools](https://tools.toolrouteai.com/price-tracker/one-time-ai-tools)
- [Usage-Based AI Tools](https://tools.toolrouteai.com/price-tracker/usage-based-ai-tools)
- [Enterprise AI Tools](https://tools.toolrouteai.com/price-tracker/enterprise-ai-tools)

## Obsidian Template Packs

Static long-tail pages:

- [Academic research templates](https://tools.toolrouteai.com/obsidian-templates/academic)
- [Project management templates](https://tools.toolrouteai.com/obsidian-templates/project)
- [Reading notes templates](https://tools.toolrouteai.com/obsidian-templates/reading)
- [Creative workflow templates](https://tools.toolrouteai.com/obsidian-templates/creative)

Each pack page includes scenario-specific metadata, structured data, FAQ content, internal links, and a dedicated Open Graph image.

## Localization

- Primary locale: English (`/`)
- Active localized entrypoint: Simplified Chinese (`/zh-cn`)
- The Chinese entrypoint is intentionally a landing and navigation layer first. Individual tool UIs remain stable in English until traffic and subscription data show which pages should be fully localized next.

## Getting Started

Install dependencies and run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Copy `.env.example` to `.env.local` and fill the values locally. Do not commit secrets.

Required variables:

- `ANTHROPIC_API_KEY_TOOLS`
- `BUTTONDOWN_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Cloudflare Pages via `@cloudflare/next-on-pages`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test:comparison
npm run test:health
npm run test:price-tracker
npm run test:side-hustle
npm run test:templates
npm run price:check -- --dry-run --limit 5
npm run smoke:prod
npm run pages:build
npm run pages:deploy
```

## CI

GitHub Actions:

- `Tools App CI`: runs on `main` pushes and pull requests. It installs dependencies, runs the comparison, price tracker, health, and template tests, then runs lint, `next build`, and `@cloudflare/next-on-pages`.
- `Tools App Production Smoke`: runs daily and by manual dispatch. It runs `npm run smoke:prod` against `https://tools.toolrouteai.com`.

Full operations notes live in [docs/OPERATIONS.md](docs/OPERATIONS.md).

Project closeout snapshot lives in [docs/PROJECT_COMPLETE.md](docs/PROJECT_COMPLETE.md).

If the local DNS resolver maps `tools.toolrouteai.com` to a private testing address, pin a Cloudflare edge IP for the smoke run:

```bash
SMOKE_RESOLVE_IP=104.21.50.114 npm run smoke:prod
```

## Cloudflare Pages

Use these settings when connecting the GitHub repository to Cloudflare Pages:

- Project name: `tools-app`
- Production branch: `main`
- Build command: `npx @cloudflare/next-on-pages`
- Build output directory: `.vercel/output/static`

Production environment variables:

- `ANTHROPIC_API_KEY_TOOLS`
- `BUTTONDOWN_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
