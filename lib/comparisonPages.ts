import { buildComparison } from "./comparison";

export type ComparisonPageConfig = {
  slug: string;
  title: string;
  heading: string;
  description: string;
  ids: string[];
};

export const comparisonBaseUrl = "https://tools.toolrouteai.com/comparison";

export const comparisonPages: ComparisonPageConfig[] = [
  {
    slug: "midjourney-vs-dall-e-3",
    title: "Midjourney vs DALL-E 3 Comparison | Tools App",
    heading: "Midjourney vs DALL-E 3 Comparison",
    description:
      "Compare indexed Midjourney and DALL-E 3 guides by pricing metadata, category, source, and tags before choosing an image workflow.",
    ids: [
      "ai-tools-pro-midjourney-vs-dall-e-3-for-brand-assets",
      "ai-tools-pro-midjourney-vs-dalle-3-comparison",
    ],
  },
  {
    slug: "notion-vs-obsidian",
    title: "Notion vs Obsidian Comparison | Tools App",
    heading: "Notion vs Obsidian Comparison",
    description:
      "Compare indexed Notion and Obsidian workflow guides for PKM, automation, API workflows, and knowledge management decisions.",
    ids: [
      "pkm-insights-notion-vs-obsidian-for-pkm",
      "notes-automate-obsidian-vs-notion-api-for-automated-workflows",
    ],
  },
  {
    slug: "n8n-vs-zapier",
    title: "n8n vs Zapier Comparison | Tools App",
    heading: "n8n vs Zapier Comparison",
    description:
      "Compare indexed n8n and Zapier automation guides by pricing metadata, category, source, and workflow tags.",
    ids: [
      "ai-tools-pro-n8n-vs-zapier-for-high-volume-lead-processing",
      "ai-tools-pro-n8n-vs-zapier-for-advanced-workflow-automation",
    ],
  },
  {
    slug: "zotero-vs-mendeley",
    title: "Zotero vs Mendeley Comparison | Tools App",
    heading: "Zotero vs Mendeley Comparison",
    description:
      "Compare indexed Zotero and Mendeley guides for Obsidian integration, academic research, citations, and PKM workflows.",
    ids: [
      "pkm-insights-zotero-vs-mendeley-for-obsidian-integration-comparison",
      "pkm-insights-mendeley-vs-zotero-obsidian-integration-2026",
    ],
  },
];

export function getComparisonPage(slug: string | undefined) {
  return comparisonPages.find((page) => page.slug === slug);
}

export function buildStaticComparisonPage(page: ComparisonPageConfig) {
  return buildComparison(page.ids);
}
