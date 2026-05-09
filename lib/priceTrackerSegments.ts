import type { PriceKind, PriceTrackerRecord } from "./priceTracker";

export type PriceTrackerSegment = {
  slug: string;
  title: string;
  heading: string;
  description: string;
  priceKinds: PriceKind[];
  searchIntent: string;
};

export const priceTrackerBaseUrl = "https://tools.toolrouteai.com/price-tracker";

export const priceTrackerSegments: PriceTrackerSegment[] = [
  {
    slug: "free-ai-tools",
    title: "Free AI Tools Price Signals | Tools App",
    heading: "Free AI Tools Price Signals",
    description:
      "Browse indexed AI tool price signals for free tiers, open-weight models, and open-source tools from the Tools App content portfolio.",
    priceKinds: ["Free"],
    searchIntent: "Find free AI tools and open-source options before comparing paid alternatives.",
  },
  {
    slug: "subscription-ai-tools",
    title: "Subscription AI Tools Price Signals | Tools App",
    heading: "Subscription AI Tools Price Signals",
    description:
      "Browse monthly and annual AI tool price signals from the Tools App content index, grouped for quick subscription cost research.",
    priceKinds: ["Monthly", "Annual"],
    searchIntent: "Compare recurring AI tool costs before committing to another monthly subscription.",
  },
  {
    slug: "one-time-ai-tools",
    title: "One-Time AI Tool Price Signals | Tools App",
    heading: "One-Time AI Tool Price Signals",
    description:
      "Browse indexed price signals for AI tools, gear, and workflow products with one-time purchase pricing.",
    priceKinds: ["One-time"],
    searchIntent: "Find tools and products that look closer to one-time purchases than recurring subscriptions.",
  },
  {
    slug: "usage-based-ai-tools",
    title: "Usage-Based AI Tool Price Signals | Tools App",
    heading: "Usage-Based AI Tool Price Signals",
    description:
      "Browse AI tool price signals that mention credits, usage, per-user billing, or pay-as-you-go pricing.",
    priceKinds: ["Usage-based"],
    searchIntent: "Spot AI products where cost may scale with seats, credits, tokens, or usage.",
  },
  {
    slug: "enterprise-ai-tools",
    title: "Enterprise AI Tool Price Signals | Tools App",
    heading: "Enterprise AI Tool Price Signals",
    description:
      "Browse AI tool price signals that mention enterprise, custom, quote-based, or contract pricing.",
    priceKinds: ["Enterprise"],
    searchIntent: "Identify tools that may require sales contact, custom quotes, or enterprise procurement.",
  },
];

export function getPriceTrackerSegment(slug: string | undefined) {
  return priceTrackerSegments.find((segment) => segment.slug === slug);
}

export function getPriceTrackerSegmentRecords(
  records: PriceTrackerRecord[],
  segment: PriceTrackerSegment,
) {
  return records.filter((record) => segment.priceKinds.includes(record.price_kind));
}
