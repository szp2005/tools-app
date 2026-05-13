import toolsIndex from "../data/tools-index.json";
import type { SourceSite, ToolIndexRecord } from "./comparison";
import { buildPriceChangePayload } from "./priceChanges";

export type PriceKind =
  | "Free"
  | "Monthly"
  | "Annual"
  | "Usage-based"
  | "Enterprise"
  | "One-time"
  | "Variable";

export type PriceTrackerRecord = {
  id: string;
  name: string;
  description: string;
  source_site: SourceSite;
  source_url: string;
  tags: string[];
  category?: string;
  pubDate?: string;
  price: string;
  price_kind: PriceKind;
};

export type PriceTrackerStats = {
  total: number;
  free: number;
  monthly: number;
  enterprise: number;
  sources: number;
};

export type PriceTrackerIndexPayload = {
  schema_version: "1";
  generated_at: string;
  source: string;
  count: number;
  latest_pub_date?: string;
  stats: PriceTrackerStats;
  changes: ReturnType<typeof buildPriceChangePayload>;
  records: PriceTrackerRecord[];
};

const siteUrl = "https://tools.toolrouteai.com";
const priceTrackerUrl = `${siteUrl}/price-tracker`;

export function getPriceTrackerRecords(limit = 240): PriceTrackerRecord[] {
  return (toolsIndex as ToolIndexRecord[])
    .filter((record) => typeof record.price === "string" && record.price.trim().length > 0)
    .sort((a, b) => {
      const dateOrder = (b.pubDate ?? "").localeCompare(a.pubDate ?? "");
      if (dateOrder !== 0) return dateOrder;

      return a.name.localeCompare(b.name);
    })
    .slice(0, limit)
    .map((record) => {
      const price = record.price?.trim() ?? "";

      return {
        id: record.id,
        name: record.name,
        description: record.description,
        source_site: record.source_site,
        source_url: record.source_url,
        tags: record.tags,
        category: record.category,
        pubDate: record.pubDate,
        price,
        price_kind: classifyPrice(price),
      };
    });
}

export function getPriceTrackerStats(records = getPriceTrackerRecords()): PriceTrackerStats {
  return {
    total: records.length,
    free: records.filter((record) => record.price_kind === "Free").length,
    monthly: records.filter((record) => record.price_kind === "Monthly").length,
    enterprise: records.filter((record) => record.price_kind === "Enterprise").length,
    sources: new Set(records.map((record) => record.source_site)).size,
  };
}

export function classifyPrice(price: string): PriceKind {
  const value = price.toLowerCase();

  if (/\bfree\b|\$0|open weights|open-source|included with/.test(value)) {
    return "Free";
  }

  if (/enterprise|custom|contract|quote/.test(value)) {
    return "Enterprise";
  }

  if (/usage|credit|token|pay as you go|per user/.test(value)) {
    return "Usage-based";
  }

  if (/month|monthly|\/mo|\/month/.test(value)) {
    return "Monthly";
  }

  if (/annual|year|yearly|\/yr|\/year/.test(value)) {
    return "Annual";
  }

  if (/\$\d/.test(value)) {
    return "One-time";
  }

  return "Variable";
}

export function buildPriceTrackerFeedXml(records = getPriceTrackerRecords(60)): string {
  const latestDate = getLatestPriceTrackerPubDate(records);

  const items = records
    .map((record) =>
      [
        "    <item>",
        `      <title>${escapeXml(record.name)}</title>`,
        `      <link>${escapeXml(record.source_url)}</link>`,
        `      <guid isPermaLink="false">${escapeXml(`tools-price:${record.id}:${record.price}`)}</guid>`,
        `      <pubDate>${formatRssDate(record.pubDate)}</pubDate>`,
        `      <category>${escapeXml(record.price_kind)}</category>`,
        `      <description>${escapeXml(
          `Price signal: ${record.price}. Source: ${record.source_site}. ${record.description}`,
        )}</description>`,
        "    </item>",
      ].join("\n"),
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>AI Tool Price Tracker</title>",
    `    <link>${priceTrackerUrl}</link>`,
    "    <description>Indexed AI tool price signals from the Tools App content portfolio.</description>",
    "    <language>en</language>",
    `    <lastBuildDate>${formatRssDate(latestDate)}</lastBuildDate>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
}

export function buildPriceTrackerIndexPayload(
  records = getPriceTrackerRecords(),
  generatedAt = new Date(),
): PriceTrackerIndexPayload {
  return {
    schema_version: "1",
    generated_at: generatedAt.toISOString(),
    source: priceTrackerUrl,
    count: records.length,
    latest_pub_date: getLatestPriceTrackerPubDate(records),
    stats: getPriceTrackerStats(records),
    changes: buildPriceChangePayload(),
    records,
  };
}

export function getLatestPriceTrackerPubDate(records: PriceTrackerRecord[]): string | undefined {
  return records
    .map((record) => record.pubDate)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);
}

function formatRssDate(value: string | undefined): string {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toUTCString();
  }

  return date.toUTCString();
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return character;
    }
  });
}
