# Tools App

`tools.toolrouteai.com` is the free AI tools and newsletter subscription engine for the one-person-company portfolio.

Current focus: free workflow tools that reuse the four-site content portfolio, collect newsletter subscribers, and run cheaply on Cloudflare Pages.

## Tools Available

- [Prompt Optimizer](https://tools.toolrouteai.com/prompt-optimizer): rewrites rough prompts into structured, model-ready instructions. Protected by Turnstile and KV-backed daily rate limits.
- [Comparison Builder](https://tools.toolrouteai.com/comparison): compares 2-5 tools from the four-site content index and exports Markdown or PDF. No LLM API call is used.
- [Obsidian Template Generator](https://tools.toolrouteai.com/obsidian-template-generator): generates Markdown template packs for research, projects, and reading workflows entirely in the browser.
- [Price Tracker](https://tools.toolrouteai.com/price-tracker): searches indexed AI tool price signals from article metadata, with filtered CSV export, RSS, and a machine-readable JSON index. This is an MVP metadata tracker, not a live price crawler. RSS: [price-tracker/feed.xml](https://tools.toolrouteai.com/price-tracker/feed.xml), JSON: [price-tracker/index.json](https://tools.toolrouteai.com/price-tracker/index.json)

## Obsidian Template Packs

Static long-tail pages:

- [Academic research templates](https://tools.toolrouteai.com/obsidian-template-generator/academic)
- [Project management templates](https://tools.toolrouteai.com/obsidian-template-generator/project)
- [Reading notes templates](https://tools.toolrouteai.com/obsidian-template-generator/reading)

Each pack page includes scenario-specific metadata, structured data, FAQ content, internal links, and a dedicated Open Graph image.

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
- `TURNSTILE_SITE_KEY`
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
npm run test:price-tracker
npm run test:templates
npm run pages:build
npm run pages:deploy
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
