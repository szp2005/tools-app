---
title: "643 Articles, 11 Google Clicks: My 4-Month AI SEO Experiment"
description: "A factual postmortem of a 4-month, 643-article, 4-site AI-generated SEO experiment that produced 11 total Google clicks and one AdSense rejection — plus what I built instead."
publishedAt: "2026-05-27"
toolName: "the free AI tools"
toolHref: "/"
ogImage: "/og-default.png"
applicationCategory: "DeveloperApplication"
keywords: ["AI SEO", "programmatic SEO", "indie hacker", "one-person company", "AdSense rejection", "AI content experiment"]
featureList: ["Prompt Optimizer", "AI Tool Comparison Builder", "Obsidian Template Generator", "AI Tool Price Tracker", "Side Hustle Ideas Generator"]
---

I spent four months building an AI-generated SEO content portfolio. Four sites, six hundred and forty-three articles, three different niches. Google gave me eleven clicks. AdSense rejected one of the sites for low-value content. This is the postmortem.

## The setup

In January 2026 I left a salaried job to build what people on Twitter were calling a one-person company. The thesis was simple and very 2025: a single operator plus Claude plus a content pipeline could produce SEO-friendly articles at a scale that used to require an agency. Pick four niches, register four domains, point the pipeline at each, wait for Google traffic, monetize with display ads and affiliate links.

This is the kind of plan that sounds reasonable in a YouTube video and obvious in a Twitter thread.

The four sites and their topic areas:

- ai.toolrouteai.com — AI tool reviews and comparisons, 172 articles
- gear.toolrouteai.com — Home office equipment, 142 articles
- notes-automate.com — Obsidian and personal knowledge management workflows, 174 English plus 174 Chinese translations
- pkm-insights.com — Personal knowledge management theory, 191 articles

Total: 679 English articles plus 174 Chinese translations, equals 853 published URLs. Across four months. That averages out to about seven articles per day, every day, including weekends. No human writer can sustain that rate. I did not try. Claude wrote every word.

## The stack

Astro 5 static sites deployed on Cloudflare Pages free tier. A content pipeline built in n8n running in Docker, calling Claude for drafts, Gemini for research, MinIO for asset storage. A custom Telegram dispatcher with nineteen slash commands for monitoring, manual triggers, and daily briefs. A cross-platform viral content scraper hitting Reddit, Hacker News, Substack RSS, YouTube transcripts. Six Cloudflare Workers running cron jobs for various pipelines.

Infrastructure cost: zero dollars per month. The whole thing ran on free tiers, hardware I already owned, and the fact that I write code faster than I write prose.

## The result

After four months and 643 indexed articles:

- Google Search Console clicks: 11
- Email subscribers: 0
- AdSense: notes-automate.com rejected for low-value content, ai.toolrouteai.com still under review
- Affiliate revenue: $0
- Direct traffic and brand searches: 0

Eleven clicks. Across four months. Across six hundred and forty-three articles. Across four domains.

That is a click-through rate that rounds to zero. If I had instead posted one thoughtful comment per day on Hacker News for four months, I would have generated more inbound traffic.

## What actually happened

I want to be precise about this part, because the obvious narrative is too simple and partly wrong.

The content was not visibly garbage. I read through several articles last week. Most of them are coherent, technically accurate, structured for SEO with the expected H2 and H3 hierarchy, an introduction paragraph, an FAQ section, and related internal links. They would pass a casual human reader's smell test. They are not Mad-Libs blogspam. They are something more interesting: technically competent and contextually empty.

Google indexed almost everything. Out of 853 URLs, roughly 580 are in the indexed bucket. The crawled-but-not-indexed bucket is real but not dominant. This is not a Google never saw my site problem.

The eleven clicks were spread across long-tail queries with single-digit monthly search volume. Things like obsidian dataview snippets for book trackers. Niche enough that there was little competition. Common enough that Google ranked me on page one for the query. But also small enough that ranking number one means one to three clicks per month, total.

AdSense's low-value content rejection is the most informative signal. It did not say too thin or duplicate. It said low value. That is a different judgment. The reviewer, or the model behind the reviewer, decided that my articles, despite being long and structured, were not adding anything a reader could not get faster from the next ten search results.

I had been telling myself for four months that I was building a scalable content business. What I had actually built was a scalable irrelevance machine.

## Where I think the mistake was

A few candidates, in order of how much I now believe each one.

### I optimized the production loop, not the distribution loop

I spent roughly eighty percent of my time on the pipeline. Making the n8n workflow more reliable. Building the dispatcher. Adding Telegram alerts, cron jobs, the viral scraper, the auto-translation system, the markdown linter, the OG image generator, the AdSense injector, the sitemap builder. All of this is in the category of make production faster.

I spent roughly five percent of my time on distribution. Submitting sitemaps. Building four random backlinks. There is no version of this experiment that works without distribution, and I treated distribution as something that would happen on its own.

If I had spent the four months differently, say eighty percent on distribution and twenty percent on writing fifty articles by hand, I am now fairly sure the outcome would have been better. Not great. But better than eleven clicks.

### SEO does not work like it did in 2021

The old playbook said write five hundred articles, build a few backlinks, wait six months, get Google traffic. People still teach this playbook. It used to work. It does not work now, at this scale, with this content type, for one operator.

Google's quality threshold has moved. The Helpful Content Update plus the December 2024 spam updates plus whatever Google is doing internally with their own AI classifiers, all together, raised the bar above what AI-generated articles can clear, even when the articles are coherent.

I should have known this from reading Google's documentation. I read the documentation. I rationalized it as applying to other people.

### Niche selection became niche of niches without me noticing

Home office gear is a reasonable niche. But the articles I produced were not best monitor 2026. They were best portable monitor for dual-screen laptop setup. The latter query has maybe thirty searches per month, globally. After Google takes its cut for shopping results and YouTube widgets, you are competing for about five organic clicks.

I had been told that long-tail equals less competition equals good. This is technically true and operationally useless. Less competition for a query with five clicks per month is still five clicks per month.

### I confused publishable with valuable

The pipeline produced articles that were publishable. They cleared the bar of not embarrassing to have on the internet. That bar is not the bar that gets traffic. The bar that gets traffic is this is the best result a reader will find for this query today. I was nowhere near that bar.

## What I think the experiment actually proved

Not that AI content does not work. That is the lazy take and it is not what my data shows.

What it proved, for me:

- AI content at scale, deployed by a solo operator with no distribution, does not produce a business in four months. Maybe in twelve months. Probably not.
- The infrastructure is the easy part. I built a sophisticated pipeline. So can you. So can ten thousand other people. None of us are going to make money from the infrastructure itself.
- The bottleneck is distribution, not production. It always was. It will be more so as production gets cheaper.
- Programmatic SEO is mostly a 2021-era pattern that smart operators are still riding the tail of, but the entrance is closed.

## What I am doing now

I am not deleting the sites. They cost zero dollars per month to run. The eleven clicks might become one thousand clicks in twelve months because Google indexing curves are long. I am simply not going to write any more articles for them.

Instead, I extracted the genuinely useful parts of my own workflow into five free tools and shipped them at tools.toolrouteai.com:

- Prompt Optimizer, which turns a vague instruction like write me a blog post about X into a structured prompt with role, constraints, and output format
- Comparison Builder, which pulls from a JSON index of around fifty AI tools and lets you pick two to five and export a Markdown or PDF comparison
- Obsidian Template Generator, browser-side only, which generates a zip of Markdown plus Dataview plus Templater files for four workflows: academic, project, reading, creative
- Price Tracker, a scheduled scraper of fifty-plus AI tool pricing pages, exposed as RSS plus JSON plus a UI for change signals
- Side Hustle Ideas, which takes your skill plus weekly hours plus starting budget and returns three realistic ideas with first-week action plans

No signup walls. No email harvesting. No API keys required. Zero dollars per month to run on the free tier. They are useful to me. They might be useful to you. If they are not, please tell me what is missing.

And I am writing this post, which is, finally, distribution.

## If you are thinking about doing the same thing

Do not, if your plan is six hundred articles, ranking, AdSense. That door is closed.

Do, if your plan is something like this: five to twenty articles, each one targeting something you have a genuine and verifiable edge on. Eighty percent of your time on distribution: Hacker News, Reddit, niche newsletters, podcast appearances, paid placement on niche sites. Treat the articles as proof of competence, not as traffic-generation devices. Monetize with consulting, products, or paid newsletters, not display ads.

Or do, if your plan is I want to learn the infrastructure. You will learn a lot. Just do not expect a business at the end.

I am a solo maker based in China. I will respond to every comment, including the ones telling me I missed something obvious. Those are the most useful.
