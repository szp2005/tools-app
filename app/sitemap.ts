import type { MetadataRoute } from "next";
import { getBlogArticles } from "@/lib/blog";
import { comparisonPages } from "@/lib/comparisonPages";
import { obsidianScenarios } from "@/lib/obsidianTemplates";
import { priceTrackerSegments } from "@/lib/priceTrackerSegments";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tools.toolrouteai.com";
  const blogArticles = getBlogArticles();

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
      url: `${base}/obsidian-templates`,
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
      url: `${base}/side-hustle-ideas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/zh-cn`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...blogArticles.map((article) => ({
      url: article.url,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...obsidianScenarios.map((scenario) => ({
      url: `${base}/obsidian-templates/${scenario.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...priceTrackerSegments.map((segment) => ({
      url: `${base}/price-tracker/${segment.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  ];
}
