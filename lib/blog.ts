import fs from "node:fs";
import path from "node:path";

const blogDir = path.join(process.cwd(), "content", "blog");
const siteUrl = "https://tools.toolrouteai.com";

export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  toolName: string;
  toolHref: string;
  ogImage: string;
  applicationCategory: string;
  keywords: string[];
  featureList: string[];
  body: string;
  blocks: BlogBlock[];
  wordCount: number;
  h2Count: number;
  h3Count: number;
  url: string;
};

type Frontmatter = Record<string, string | string[]>;

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  return fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .sort();
}

export function getBlogArticles(): BlogArticle[] {
  return getBlogSlugs()
    .map((slug) => getBlogArticle(slug))
    .filter((article): article is BlogArticle => Boolean(article));
}

export function getBlogArticle(slug: string): BlogArticle | null {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }

  const filePath = path.join(blogDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(raw);
  const blocks = parseBlocks(body);
  const title = valueToString(frontmatter.title) ?? titleFromSlug(slug);
  const description = valueToString(frontmatter.description) ?? "";
  const toolHref = valueToString(frontmatter.toolHref) ?? "/";
  const keywords = valueToArray(frontmatter.keywords);

  return {
    slug,
    title,
    description,
    publishedAt: valueToString(frontmatter.publishedAt) ?? "2026-05-13",
    toolName: valueToString(frontmatter.toolName) ?? "Tools App",
    toolHref,
    ogImage: valueToString(frontmatter.ogImage) ?? "/og-default.png",
    applicationCategory: valueToString(frontmatter.applicationCategory) ?? "ProductivityApplication",
    keywords,
    featureList: valueToArray(frontmatter.featureList),
    body,
    blocks,
    wordCount: countWords(body),
    h2Count: blocks.filter((block) => block.type === "h2").length,
    h3Count: blocks.filter((block) => block.type === "h3").length,
    url: `${siteUrl}/blog/${slug}`,
  };
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw.trim() };
  }

  const frontmatter: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim() || !line.includes(":")) {
      continue;
    }
    const [key, ...rest] = line.split(":");
    const rawValue = rest.join(":").trim();
    frontmatter[key.trim()] = parseFrontmatterValue(rawValue);
  }

  return { frontmatter, body: match[2].trim() };
}

function parseFrontmatterValue(rawValue: string): string | string[] {
  const trimmed = rawValue.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }
  return stripQuotes(trimmed);
}

function parseBlocks(body: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  const paragraph: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ").replace(/\s+/g, " ").trim() });
      paragraph.length = 0;
    }
  }

  function flushList() {
    if (listItems.length) {
      blocks.push({ type: "ul", items: listItems });
      listItems = [];
    }
  }

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function countWords(body: string): number {
  const cleaned = body
    .replace(/^#{2,3}\s+/gm, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/[^A-Za-z0-9'-]+/g, " ");
  return cleaned.trim().split(/\s+/).filter(Boolean).length;
}

function valueToString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function valueToArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, "");
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
