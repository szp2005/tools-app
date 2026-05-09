import type { MetadataRoute } from "next";
import { comparisonPages } from "@/lib/comparisonPages";
import { priceTrackerSegments } from "@/lib/priceTrackerSegments";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tools.toolrouteai.com";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    {
      url: `${base}/prompt-optimizer`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/comparison`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...comparisonPages.map((page) => ({
      url: `${base}/comparison/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    {
      url: `${base}/obsidian-template-generator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/price-tracker`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/obsidian-template-generator/academic`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/obsidian-template-generator/project`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/obsidian-template-generator/reading`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...priceTrackerSegments.map((segment) => ({
      url: `${base}/price-tracker/${segment.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  ];
}
