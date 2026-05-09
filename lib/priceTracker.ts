import toolsIndex from "../data/tools-index.json";
import type { SourceSite, ToolIndexRecord } from "./comparison";

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
