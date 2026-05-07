# Tools App

`tools.toolrouteai.com` is the free AI tools and newsletter subscription engine for the one-person-company portfolio.

Week 1 focuses on shipping the Prompt Optimizer, Cloudflare Turnstile protection, Buttondown newsletter capture, and Cloudflare Pages deployment.

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
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
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
