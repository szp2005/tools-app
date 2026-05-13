# Project 2 Complete: Tools App

Date: 2026-05-09

Production: <https://tools.toolrouteai.com>

Repository: <https://github.com/szp2005/tools-app>

## Outcome

Tools App is now a production-ready public tools hub for the one-person-company portfolio.

It has five usable tools, content-backed SEO pages, machine-readable feeds, newsletter integration, production smoke checks, GitHub Actions verification, and an operations runbook.

## Live Tools

| Tool | URL | Status |
| --- | --- | --- |
| Prompt Optimizer | `/prompt-optimizer` | Live, Turnstile-protected, KV rate-limited |
| Comparison Builder | `/comparison` | Live, zero LLM cost, Markdown/PDF export |
| Obsidian Template Generator | `/obsidian-template-generator` | Live, browser-only Markdown packs |
| AI Tool Price Tracker | `/price-tracker` | Live, metadata tracker with RSS/JSON/CSV |
| Side Hustle Ideas | `/side-hustle-ideas` | Live, Turnstile-protected, KV rate-limited |

## Data Assets

| Asset | Current Count | Source |
| --- | ---: | --- |
| Tools index | 671 records | Four content sites |
| Price signals | 211 records | `data/tools-index.json` price metadata |
| Obsidian index | Generated index | Four content sites |
| Source sites | 4 | ai-tools-pro, home-office-gear, notes-automate, pkm-insights |

## SEO Surface

Main tool pages:

- `/prompt-optimizer`
- `/comparison`
- `/obsidian-template-generator`
- `/price-tracker`
- `/side-hustle-ideas`
- `/blog`

Comparison long-tail pages:

- `/comparison/midjourney-vs-dall-e-3`
- `/comparison/notion-vs-obsidian`
- `/comparison/n8n-vs-zapier`
- `/comparison/zotero-vs-mendeley`
- `/comparison/claude-3-5-sonnet-vs-gpt-4o`
- `/comparison/custom-gpt-vs-claude-projects`
- `/comparison/copy-ai-vs-jasper`
- `/comparison/rytr-vs-copy-ai`
- `/comparison/make-vs-zapier`
- `/comparison/adobe-firefly-vs-canva-magic-studio`
- `/comparison/stable-diffusion-vs-midjourney`
- `/comparison/perplexity-ai-vs-chatgpt`
- `/comparison/grammarly-vs-prowritingaid`
- `/comparison/logseq-vs-heptabase`
- `/comparison/heptabase-vs-scrintal`
- `/comparison/obsidian-canvas-vs-excalidraw`
- `/comparison/obsidian-dataview-vs-templater`
- `/comparison/n8n-obsidian-automation-vs-manual-notes`
- `/comparison/elevenlabs-vs-play-ht`

Blog tutorial pages:

- `/blog/how-to-use-prompt-optimizer-effectively`
- `/blog/ai-tool-comparison-guide-for-solopreneurs`
- `/blog/obsidian-template-best-practices`
- `/blog/ai-tool-price-monitoring-strategy`
- `/blog/finding-the-right-side-hustle-with-ai`

Obsidian scenario pages:

- `/obsidian-template-generator/academic`
- `/obsidian-template-generator/project`
- `/obsidian-template-generator/reading`

Price Tracker segment pages:

- `/price-tracker/free-ai-tools`
- `/price-tracker/subscription-ai-tools`
- `/price-tracker/one-time-ai-tools`
- `/price-tracker/usage-based-ai-tools`
- `/price-tracker/enterprise-ai-tools`

## Machine-Readable Endpoints

- `/health.json`
- `/price-tracker/feed.xml`
- `/price-tracker/index.json`
- `/sitemap.xml`
- `/robots.txt`

Closeout health shape (abbreviated):

```json
{
  "status": "ok",
  "tools": [
    {
      "name": "Prompt Optimizer",
      "path": "/prompt-optimizer",
      "status": "available"
    }
  ],
  "indexes": {
    "tools": { "total": 671, "source_sites": 4 },
    "obsidian": { "total": 500 },
    "price_tracker": { "total": 211, "free": 102, "monthly": 37, "enterprise": 3, "sources": 4 }
  },
  "seo_pages": {
    "comparison_pairs": 19,
    "price_segments": 5,
    "obsidian_scenarios": 4,
    "blog_articles": 5
  }
}
```

## Newsletter Integration

Parent dispatcher command:

```bash
cd /Users/szp2005/one-person-company
./venv/bin/python dispatcher.py /newsletter weekly --dry-run
```

Newsletter draft generation now includes:

- 4 recent articles from the four-site portfolio
- Prompt of the week
- 3 Price Tracker signals from `/price-tracker/index.json`
- 1 rotating Comparison page pick

Boundary:

- Draft creation only.
- No automatic publishing.
- User reviews and publishes from Buttondown manually.

## Verification

Local full verification:

```bash
npm run test:comparison
npm run test:price-tracker
npm run test:health
npm run test:blog
npm run test:side-hustle
npm run test:templates
npm run lint
npm run build
npm run pages:build
```

Production verification:

```bash
SMOKE_RESOLVE_IP=104.21.50.114 npm run smoke:prod
```

Closeout smoke expectation:

```text
Summary: 17/17 passed
```

GitHub Actions:

- `Tools App CI`: tests, lint, Next build, Cloudflare Pages build
- `Tools App Production Smoke`: daily/manual production smoke

## Operations

Primary runbook:

- [Operations Runbook](./OPERATIONS.md)

Use it for:

- Content index rebuilds
- Obsidian index rebuilds
- Deployment verification
- Newsletter dry-run and draft generation
- Environment variable checks
- Known limits and next work

## Known Limits

- Price Tracker is not a live crawler.
- Price metadata can drift from vendor reality.
- Comparison long-tail pages are intentionally limited to curated pairs with indexed source coverage.
- Manual `wrangler pages deploy` requires `CLOUDFLARE_API_TOKEN`.
- `og-default.png` remains a generic placeholder and can be improved later.

## Safe Future Work

Good next steps:

- Add more static comparison pages only when source coverage is strong.
- Add weekly health report command in `dispatcher.py`.
- Add a changelog page for new tools and index refreshes.
- Improve OG images with a designed Canva asset.
- Add lightweight analytics review once traffic exists.

Avoid by default:

- High-maintenance crawlers without a maintenance plan.
- Automatic newsletter publishing.
- Broad new tools before validating traffic and newsletter engagement.

## Closeout Statement

Project 2 can be considered complete for the current autonomous build phase.

It is live, documented, monitored, indexed, and connected to the newsletter workflow. Future work should be treated as growth iteration, not MVP completion.
