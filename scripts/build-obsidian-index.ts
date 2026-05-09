import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type SourceSite = "ai-tools-pro" | "home-office-gear" | "notes-automate" | "pkm-insights";
type Scenario = "academic" | "project" | "reading";

type SiteConfig = {
  slug: SourceSite;
  baseUrl: string;
  postsDir: string;
};

type Frontmatter = Record<string, unknown>;

type ObsidianIndexRecord = {
  id: string;
  title: string;
  description: string;
  source_site: SourceSite;
  source_url: string;
  tags: string[];
  scenarios: Scenario[];
  pubDate?: string;
  slug: string;
  source_path: string;
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const toolsAppRoot = path.resolve(currentDir, "..");
const workspaceRoot = path.resolve(toolsAppRoot, "..");
const outputPath = path.join(toolsAppRoot, "data", "obsidian-index.json");

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

const obsidianSignals = [
  "obsidian",
  "pkm",
  "zettelkasten",
  "templater",
  "dataview",
  "markdown",
  "vault",
  "note-taking",
  "notes",
  "knowledge management",
  "research",
  "citation",
  "reading",
  "book notes",
  "daily notes",
  "para method",
  "automation",
  "n8n",
  "webhook",
];

const scenarioSignals: Record<Scenario, string[]> = {
  academic: ["research", "academic", "citation", "zotero", "mendeley", "literature", "paper", "source", "synthesis"],
  project: ["project", "task", "workflow", "automation", "n8n", "webhook", "dashboard", "daily notes", "para method"],
  reading: ["reading", "book", "writing", "zettelkasten", "pkm", "knowledge", "idea", "long-form", "longform"],
};

async function main() {
  const records: ObsidianIndexRecord[] = [];
  const perSite = new Map<SourceSite, number>();

  for (const site of sites) {
    const files = await collectMarkdownFiles(site.postsDir);
    const siteRecords = await Promise.all(files.map((file) => buildRecord(site, file)));
    const visibleRecords = siteRecords.filter((record): record is ObsidianIndexRecord => record !== null);

    perSite.set(site.slug, visibleRecords.length);
    records.push(...visibleRecords);
  }

  records.sort((a, b) => {
    const scoreOrder = scenarioWeight(b) - scenarioWeight(a);
    if (scoreOrder !== 0) return scoreOrder;

    const dateOrder = (b.pubDate ?? "").localeCompare(a.pubDate ?? "");
    if (dateOrder !== 0) return dateOrder;

    return a.title.localeCompare(b.title);
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

async function buildRecord(site: SiteConfig, filePath: string): Promise<ObsidianIndexRecord | null> {
  const raw = await readFile(filePath, "utf8");
  const parsed = parseFrontmatter(raw);
  const frontmatter = parsed.frontmatter;

  if (frontmatter.draft === true) return null;

  const slug = valueToString(frontmatter.slug) ?? slugFromPath(filePath);
  const title = valueToString(frontmatter.title) ?? titleFromSlug(slug);
  const description = valueToString(frontmatter.description) ?? buildSnippet(parsed.body) ?? title;
  const tags = valueToStringArray(frontmatter.tags);
  const haystack = normalizeSearchText([title, description, tags.join(" "), parsed.body.slice(0, 2400)].join(" "));

  if (!obsidianSignals.some((signal) => haystack.includes(signal))) {
    return null;
  }

  const scenarios = inferScenarios(haystack);

  return {
    id: buildRecordId(site.slug, slug),
    title,
    description,
    source_site: site.slug,
    source_url: `${site.baseUrl}/posts/${slug}/`,
    tags,
    scenarios,
    pubDate: normalizeDate(valueToString(frontmatter.pubDate)),
    slug,
    source_path: relative(filePath),
  };
}

function inferScenarios(haystack: string): Scenario[] {
  const matches = (Object.entries(scenarioSignals) as Array<[Scenario, string[]]>)
    .map(([scenario, signals]) => ({
      scenario,
      score: signals.reduce((total, signal) => total + (haystack.includes(signal) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.scenario);

  return matches.length > 0 ? matches : ["project"];
}

function scenarioWeight(record: ObsidianIndexRecord) {
  return record.scenarios.length * 10 + (record.source_site === "notes-automate" || record.source_site === "pkm-insights" ? 3 : 0);
}

function buildRecordId(site: SourceSite, slug: string): string {
  return `${site}-${slug}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };

  const frontmatter: Frontmatter = {};
  let currentArrayKey: string | null = null;

  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const arrayItem = line.match(/^\s*-\s+(.+)$/);
    if (currentArrayKey && arrayItem) {
      const existing = frontmatter[currentArrayKey];
      if (Array.isArray(existing)) existing.push(parseScalar(arrayItem[1]));
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
  if (value.startsWith("[") && value.endsWith("]")) return parseInlineArray(value);

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

  if (buffer.trim()) items.push(stripQuotes(buffer.trim()));
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
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function buildSnippet(body: string): string | undefined {
  const paragraph = body
    .split(/\n{2,}/)
    .map(cleanMarkdown)
    .find((candidate) => candidate && !/^as an amazon associate/i.test(candidate) && !/^#/.test(candidate));
  return truncate(paragraph ?? "", 220);
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

function valueToString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function valueToStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => valueToString(item)).filter((item): item is string => Boolean(item));
  }
  const single = valueToString(value);
  return single ? [single] : [];
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ");
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

function validateRecords(records: ObsidianIndexRecord[]) {
  if (records.length < 80) {
    throw new Error(`Expected at least 80 Obsidian/PKM records, got ${records.length}.`);
  }

  const missingRequired = records.filter((record) => !record.title || !record.description || record.scenarios.length === 0);
  if (missingRequired.length > 0) {
    throw new Error(`Records missing required fields: ${missingRequired.slice(0, 5).map((record) => record.source_path).join(", ")}`);
  }
}

function relative(filePath: string): string {
  return path.relative(workspaceRoot, filePath);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
