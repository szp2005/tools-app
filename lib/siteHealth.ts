import obsidianIndex from "@/data/obsidian-index.json";
import toolsIndex from "@/data/tools-index.json";
import { comparisonPages } from "./comparisonPages";
import type { ToolIndexRecord } from "./comparison";
import { obsidianScenarios } from "./obsidianTemplates";
import { getPriceTrackerRecords, getPriceTrackerStats } from "./priceTracker";
import { priceTrackerSegments } from "./priceTrackerSegments";

export type SiteHealthPayload = {
  schema_version: "1";
  generated_at: string;
  status: "ok";
  site: string;
  locales: string[];
  tools: Array<{
    name: string;
    path: string;
    status: "available";
  }>;
  indexes: {
    tools: {
      total: number;
      source_sites: number;
    };
    obsidian: {
      total: number;
    };
    price_tracker: {
      total: number;
      free: number;
      monthly: number;
      enterprise: number;
      sources: number;
    };
  };
  seo_pages: {
    comparison_pairs: number;
    price_segments: number;
    obsidian_scenarios: number;
  };
  machine_feeds: {
    price_tracker_rss: string;
    price_tracker_json: string;
  };
};

const siteUrl = "https://tools.toolrouteai.com";

export function buildSiteHealthPayload(generatedAt = new Date()): SiteHealthPayload {
  const toolRecords = toolsIndex as ToolIndexRecord[];
  const priceRecords = getPriceTrackerRecords();

  return {
    schema_version: "1",
    generated_at: generatedAt.toISOString(),
    status: "ok",
    site: siteUrl,
    locales: ["en", "zh-CN"],
    tools: [
      { name: "Prompt Optimizer", path: "/prompt-optimizer", status: "available" },
      { name: "Comparison Builder", path: "/comparison", status: "available" },
      { name: "Obsidian Template Generator", path: "/obsidian-templates", status: "available" },
      { name: "Price Tracker", path: "/price-tracker", status: "available" },
      { name: "Side Hustle Ideas", path: "/side-hustle-ideas", status: "available" },
    ],
    indexes: {
      tools: {
        total: toolRecords.length,
        source_sites: new Set(toolRecords.map((record) => record.source_site)).size,
      },
      obsidian: {
        total: (obsidianIndex as unknown[]).length,
      },
      price_tracker: getPriceTrackerStats(priceRecords),
    },
    seo_pages: {
      comparison_pairs: comparisonPages.length,
      price_segments: priceTrackerSegments.length,
      obsidian_scenarios: obsidianScenarios.length,
    },
    machine_feeds: {
      price_tracker_rss: `${siteUrl}/price-tracker/feed.xml`,
      price_tracker_json: `${siteUrl}/price-tracker/index.json`,
    },
  };
}
