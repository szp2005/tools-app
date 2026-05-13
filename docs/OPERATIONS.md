# Tools App Operations Runbook

Production URL: <https://tools.toolrouteai.com>

Repository: <https://github.com/szp2005/tools-app>

This project is the public tools hub for the one-person-company portfolio. It should stay low-maintenance: reuse the existing four-site content index, avoid crawlers unless explicitly planned, and never send newsletter emails automatically.

## Current Product Surface

Core tools:

- Prompt Optimizer: `/prompt-optimizer`
- Comparison Builder: `/comparison`
- Obsidian Template Generator: `/obsidian-templates`
- AI Tool Price Tracker: `/price-tracker`
- Side Hustle Ideas: `/side-hustle-ideas`
- Chinese entrypoint: `/zh-cn`
- Blog index: `/blog`

Machine-readable endpoints:

- Health summary: `/health.json`
- Price Tracker RSS: `/price-tracker/feed.xml`
- Price Tracker JSON: `/price-tracker/index.json`
- Sitemap: `/sitemap.xml`
- Robots: `/robots.txt`

SEO index pages:

- Blog tutorials:
  - `/blog/how-to-use-prompt-optimizer-effectively`
  - `/blog/ai-tool-comparison-guide-for-solopreneurs`
  - `/blog/obsidian-template-best-practices`
  - `/blog/ai-tool-price-monitoring-strategy`
  - `/blog/finding-the-right-side-hustle-with-ai`

- Comparison pages:
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
- Obsidian scenario pages:
  - `/obsidian-templates/academic`
  - `/obsidian-templates/project`
  - `/obsidian-templates/reading`
  - `/obsidian-templates/creative`
- Price Tracker segment pages:
  - `/price-tracker/free-ai-tools`
  - `/price-tracker/subscription-ai-tools`
  - `/price-tracker/one-time-ai-tools`
  - `/price-tracker/usage-based-ai-tools`
  - `/price-tracker/enterprise-ai-tools`

## Local Verification

Run this before committing product code:

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

Run this after production deployment:

```bash
npm run smoke:prod
```

If local DNS maps `tools.toolrouteai.com` to a private testing address, pin a Cloudflare edge IP:

```bash
SMOKE_RESOLVE_IP=104.21.50.114 npm run smoke:prod
```

Expected production smoke result at project close:

```text
Summary: 18/18 passed
```

## Deployment

Cloudflare Pages is connected to the `main` branch of `szp2005/tools-app`.

The normal deployment path is:

1. Commit to `tools-app`.
2. Push to GitHub `main`.
3. Cloudflare Pages auto-builds and deploys.
4. Run production smoke after the new route/content is visible.

Manual deploy command:

```bash
npm run pages:deploy
```

Current local shell does not include `CLOUDFLARE_API_TOKEN`, so manual wrangler upload may fail locally. GitHub-triggered Cloudflare Pages deployment is the reliable path unless a token is added.

## Environment Variables

Cloudflare Pages production environment should include:

- `ANTHROPIC_API_KEY_TOOLS`
- `BUTTONDOWN_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` (optional, 32-character beacon token)

Public Turnstile site key:

```text
0x4AAAAAADKi1ni7TNQVv2w9
```

Do not use `ANTHROPIC_API_KEY` for tools-app. The project uses `ANTHROPIC_API_KEY_TOOLS`.

## Content Index Updates

The comparison and price tracker tools use `data/tools-index.json`.

Rebuild it after the four content sites add meaningful new posts:

```bash
npm run build:index
```

The Obsidian template generator uses `data/obsidian-index.json`.

Rebuild it after the four content sites add meaningful Obsidian/PKM posts:

```bash
npm run build:obsidian-index
```

After rebuilding indexes:

```bash
npm run test:comparison
npm run test:price-tracker
npm run test:templates
npm run build
npm run pages:build
```

Commit changed `data/*.json` files only if the diff is expected.

## Newsletter Workflow

Newsletter creation is in the parent repository:

```bash
cd /Users/szp2005/one-person-company
./venv/bin/python dispatcher.py /newsletter weekly --dry-run
```

The dry run should include:

- 4 recent articles
- Prompt of the week
- 3 Price Tracker signals from `/price-tracker/index.json`
- 1 rotating Comparison page pick

Create a Buttondown draft only after reviewing dry-run output:

```bash
./venv/bin/python dispatcher.py /newsletter weekly
```

Important boundary:

- The dispatcher creates `status: draft`.
- The user manually previews and publishes in Buttondown.
- Never add automatic publishing unless the user explicitly asks.

Newsletter stats archive:

```bash
cd /Users/szp2005/one-person-company
./venv/bin/python dispatcher.py /newsletter-stats latest
./venv/bin/python dispatcher.py /newsletter-stats em_5gsj3ja1y897zbbj0j4n3nm861
```

Stats are appended to `reports/newsletter_stats.md`.

## Cloudflare Web Analytics

The app injects Cloudflare Web Analytics only when a valid 32-character token is present:

```bash
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=<32-char-token>
```

Recommended setup:

1. Cloudflare Dashboard → Analytics & Logs → Web Analytics.
2. Add site: `tools.toolrouteai.com`.
3. Copy the beacon token from the JS snippet.
4. Add it to Cloudflare Pages → tools-app → Settings → Environment variables.
5. Retry production deployment.
6. Visit `/`, `/comparison`, and `/zh-cn`, then verify PV / UV / referrers in Cloudflare Web Analytics after data appears.

## GitHub Actions

Workflows:

- `Tools App CI`
  - Runs on `main` push, pull request, and manual dispatch.
  - Runs tests, lint, Next build, and Cloudflare Pages build.
- `Tools App Production Smoke`
  - Runs daily and by manual dispatch.
  - Runs `npm run smoke:prod` against production.

Production smoke is intentionally decoupled from push deploys to avoid false failures while Cloudflare Pages is still rolling out.

## Common Checks

Health:

```bash
curl -s https://tools.toolrouteai.com/health.json | jq
```

Expected closeout shape (tools array abbreviated):

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
    "comparison_pairs": 4,
    "price_segments": 5,
    "obsidian_scenarios": 3
  }
}
```

Guardrails:

```bash
curl -i -X POST https://tools.toolrouteai.com/api/optimize \
  -H 'content-type: application/json' \
  -d '{"prompt":"Improve this prompt"}'
```

Expected: HTTP 403 without Turnstile token.

Comparison API:

```bash
curl 'https://tools.toolrouteai.com/api/comparison/search?q=midjourney'
```

Expected: JSON array with at least one result.

## Known Limits

- Price Tracker is a metadata tracker, not a live crawler.
- Price fields come from article frontmatter and snippets; users should verify vendor pages before purchase.
- Comparison static pages intentionally use a curated, high-confidence list of pairs with indexed source coverage, decision copy, and FAQ schema to avoid thin or misleading pages.
- Manual `wrangler pages deploy` needs `CLOUDFLARE_API_TOKEN` in the local shell.
- GitHub Actions status was not checked locally because the `gh` CLI is not installed on this machine.

## Safe Next Work

Good next steps:

- Add more high-confidence comparison static pages after confirming source coverage.
- Add a weekly health report command in `dispatcher.py`.
- Add a lightweight changelog page for new tools and index updates.
- Improve final `og-default.png` with a designed Canva asset.

Avoid by default:

- Price crawlers without a maintenance plan.
- Automatic newsletter publishing.
- Changing project one or project three handoff files from this project context.
