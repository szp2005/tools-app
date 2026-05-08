import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type SourceSite =
  | "ai-tools-pro"
  | "home-office-gear"
  | "notes-automate"
  | "pkm-insights";

type SiteConfig = {
  slug: SourceSite;
  baseUrl: string;
  postsDir: string;
};

type Frontmatter = Record<string, unknown>;

type ToolIndexRecord = {
  id: string;
  name: string;
  description: string;
  source_site: SourceSite;
  source_url: string;
  tags: string[];
  snippet: string;
  slug: string;
  pubDate?: string;
  category?: string;
  price?: string;
  rating?: string;
  source_path: string;
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const toolsAppRoot = path.resolve(currentDir, "..");
const workspaceRoot = path.resolve(toolsAppRoot, "..");
const outputPath = path.join(toolsAppRoot, "data", "tools-index.json");

const sites: SiteConfig[] = [
  {
    slug: "ai-tools-pro",
    baseUrl: "https://ai.toolrouteai.com",
    postsDir: path.join(workspaceRoot, "ai-tools-pro", "content", "posts"),
  },
  {
    slug: "home-office-gear",
    baseUrl: "https://gear.toolrouteai.com",
    postsDir: path.join(workspaceRoot, "home-office-gear", "content", "posts"),
  },
  {
    slug: "notes-automate",
    baseUrl: "https://notes-automate.com",
    postsDir: path.join(workspaceRoot, "notes-automate", "content", "posts"),
  },
  {
    slug: "pkm-insights",
    baseUrl: "https://pkm.notes-automate.com",
    postsDir: path.join(workspaceRoot, "pkm-insights", "content", "posts"),
  },
];

async function main() {
  const records: ToolIndexRecord[] = [];
  const perSite = new Map<SourceSite, number>();

  for (const site of sites) {
    const files = await collectMarkdownFiles(site.postsDir);
    const siteRecords = await Promise.all(
      files.map(async (file) => buildRecord(site, file)),
    );
    const visibleRecords = siteRecords.filter(
      (record): record is ToolIndexRecord => record !== null,
    );

    perSite.set(site.slug, visibleRecords.length);
    records.push(...visibleRecords);
  }

  records.sort((a, b) => {
    const siteOrder = a.source_site.localeCompare(b.source_site);
    if (siteOrder !== 0) return siteOrder;

    const dateOrder = (b.pubDate ?? "").localeCompare(a.pubDate ?? "");
    if (dateOrder !== 0) return dateOrder;

    return a.name.localeCompare(b.name);
  });

  validateRecords(records);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");

  console.log(`Wrote ${records.length} records to ${relative(outputPath)}`);
  for (const site of sites) {
    console.log(`- ${site.slug}: ${perSite.get(site.slug) ?? 0}`);
  }
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "zh-cn") continue;
      files.push(...(await collectMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function buildRecord(
  site: SiteConfig,
  filePath: string,
): Promise<ToolIndexRecord | null> {
  const raw = await readFile(filePath, "utf8");
  const parsed = parseFrontmatter(raw);
  const frontmatter = parsed.frontmatter;

  if (frontmatter.draft === true) {
    return null;
  }

  const slug = valueToString(frontmatter.slug) ?? slugFromPath(filePath);
  const name = valueToString(frontmatter.title) ?? titleFromSlug(slug);
  const tags = valueToStringArray(frontmatter.tags);
  const snippet = buildSnippet(parsed.body, valueToString(frontmatter.description));
  const description =
    valueToString(frontmatter.description) ?? snippet ?? titleFromSlug(slug);

  return {
    id: `${site.slug}:${slug}`,
    name,
    description,
    source_site: site.slug,
    source_url: `${site.baseUrl}/posts/${slug}/`,
    tags,
    snippet: snippet ?? description,
    slug,
    pubDate: normalizeDate(valueToString(frontmatter.pubDate)),
    category:
      valueToString(frontmatter.category) ?? valueToString(frontmatter.type),
    price: extractBodyField(parsed.body, "Price"),
    rating: extractBodyField(parsed.body, "Rating"),
    source_path: relative(filePath),
  };
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatter: Frontmatter = {};
  let currentArrayKey: string | null = null;

  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const arrayItem = line.match(/^\s*-\s+(.+)$/);
    if (currentArrayKey && arrayItem) {
      const existing = frontmatter[currentArrayKey];
      if (Array.isArray(existing)) {
        existing.push(parseScalar(arrayItem[1]));
      }
      continue;
    }

    const keyValue = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!keyValue) continue;

    const [, key, rawValue] = keyValue;
    currentArrayKey = null;

    if (rawValue.trim() === "") {
      frontmatter[key] = [];
      currentArrayKey = key;
      continue;
    }

    frontmatter[key] = parseScalar(rawValue);
  }

  return { frontmatter, body: match[2] };
}

function parseScalar(rawValue: string): unknown {
  const value = stripComment(rawValue).trim();

  if (value.startsWith("[") && value.endsWith("]")) {
    return parseInlineArray(value);
  }

  const unquoted = stripQuotes(value);
  if (/^(true|false)$/i.test(unquoted)) return unquoted.toLowerCase() === "true";
  if (/^-?\d+(\.\d+)?$/.test(unquoted)) return Number(unquoted);

  return unquoted;
}

function parseInlineArray(value: string): string[] {
  const inner = value.slice(1, -1).trim();
  if (!inner) return [];

  const items: string[] = [];
  let buffer = "";
  let quote: string | null = null;

  for (const char of inner) {
    if ((char === "'" || char === '"') && quote === null) {
      quote = char;
      buffer += char;
      continue;
    }

    if (char === quote) {
      quote = null;
      buffer += char;
      continue;
    }

    if (char === "," && quote === null) {
      items.push(stripQuotes(buffer.trim()));
      buffer = "";
      continue;
    }

    buffer += char;
  }

  if (buffer.trim()) {
    items.push(stripQuotes(buffer.trim()));
  }

  return items.filter(Boolean);
}

function stripComment(value: string): string {
  let quote: string | null = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if ((char === "'" || char === '"') && quote === null) {
      quote = char;
      continue;
    }

    if (char === quote) {
      quote = null;
      continue;
    }

    if (char === "#" && quote === null && /\s/.test(value[index - 1] ?? " ")) {
      return value.slice(0, index);
    }
  }

  return value;
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function buildSnippet(body: string, description?: string): string | undefined {
  const quickAnswer = body.match(
    />\s*\*\*Quick Answer:\*\*\s*([\s\S]*?)(?:\n\n|$)/i,
  );

  if (quickAnswer) {
    return truncate(cleanMarkdown(quickAnswer[1]), 320);
  }

  const paragraph = body
    .split(/\n{2,}/)
    .map(cleanMarkdown)
    .find(
      (candidate) =>
        candidate &&
        !/^as an amazon associate/i.test(candidate) &&
        !/^#/.test(candidate),
    );

  return truncate(paragraph ?? description ?? "", 320);
}

function cleanMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~>#]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractBodyField(body: string, label: "Price" | "Rating"): string | undefined {
  const match = body.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i"));
  return match ? truncate(cleanMarkdown(match[1]), 160) : undefined;
}

function valueToString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function valueToStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => valueToString(item))
      .filter((item): item is string => Boolean(item));
  }

  const single = valueToString(value);
  return single ? [single] : [];
}

function slugFromPath(filePath: string): string {
  return path.basename(filePath).replace(/\.(md|mdx)$/i, "");
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return new Date(timestamp).toISOString().slice(0, 10);
}

function truncate(value: string, length: number): string | undefined {
  const cleaned = value.trim();
  if (!cleaned) return undefined;
  if (cleaned.length <= length) return cleaned;
  return `${cleaned.slice(0, length - 1).trimEnd()}...`;
}

function validateRecords(records: ToolIndexRecord[]) {
  if (records.length < 500) {
    throw new Error(`Expected at least 500 records, got ${records.length}.`);
  }

  const missingRequired = records.filter(
    (record) => !record.name || !record.description,
  );

  if (missingRequired.length > 0) {
    const examples = missingRequired
      .slice(0, 5)
      .map((record) => record.source_path)
      .join(", ");
    throw new Error(`Records missing name or description: ${examples}`);
  }
}

function relative(filePath: string): string {
  return path.relative(workspaceRoot, filePath);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
