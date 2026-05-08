import toolsIndex from "../data/tools-index.json";

export type SourceSite =
  | "ai-tools-pro"
  | "home-office-gear"
  | "notes-automate"
  | "pkm-insights";

export type ToolIndexRecord = {
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

export type ComparisonSearchResult = Pick<
  ToolIndexRecord,
  "id" | "name" | "description" | "source_site" | "snippet"
>;

export type ComparisonTool = Pick<
  ToolIndexRecord,
  "id" | "name" | "source_site" | "source_url"
>;

export type ComparisonMatrixRow = {
  dimension: "Price" | "Category" | "Rating" | "Source Site" | "Tags";
  values: string[];
};

export type ComparisonBuildResult = {
  tools: ComparisonTool[];
  matrix: ComparisonMatrixRow[];
};

type IndexCache = {
  records: ToolIndexRecord[];
  byId: Map<string, ToolIndexRecord>;
  expiresAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_SEARCH_LIMIT = 25;
const DEFAULT_SEARCH_LIMIT = 10;
const MAX_BUILD_IDS = 5;
const ID_PATTERN = /^[a-z0-9-]+$/;

let cachedIndex: IndexCache | null = null;

export function getComparisonIndex(now = Date.now()): IndexCache {
  if (cachedIndex && cachedIndex.expiresAt > now) {
    return cachedIndex;
  }

  const records = toolsIndex as ToolIndexRecord[];
  cachedIndex = {
    records,
    byId: new Map(records.map((record) => [record.id, record])),
    expiresAt: now + CACHE_TTL_MS,
  };

  return cachedIndex;
}

export function parseSearchLimit(value: string | null): number {
  if (!value) {
    return DEFAULT_SEARCH_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(parsed, MAX_SEARCH_LIMIT);
}

export function searchTools(query: string, limit = DEFAULT_SEARCH_LIMIT): ComparisonSearchResult[] {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) {
    return [];
  }

  const terms = normalizedQuery.split(" ").filter(Boolean);
  const cappedLimit = Math.min(Math.max(limit, 1), MAX_SEARCH_LIMIT);

  return getComparisonIndex()
    .records.map((record) => ({
      record,
      score: scoreRecord(record, normalizedQuery, terms),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const dateOrder = (b.record.pubDate ?? "").localeCompare(a.record.pubDate ?? "");
      if (dateOrder !== 0) return dateOrder;

      return a.record.name.localeCompare(b.record.name);
    })
    .slice(0, cappedLimit)
    .map(({ record }) => ({
      id: record.id,
      name: record.name,
      description: record.description,
      source_site: record.source_site,
      snippet: record.snippet,
    }));
}

export function buildComparison(ids: string[]): ComparisonBuildResult {
  const index = getComparisonIndex();
  const tools = ids.map((id) => {
    const record = index.byId.get(id);
    if (!record) {
      throw new Error(`Unknown comparison id: ${id}`);
    }

    return record;
  });

  return {
    tools: tools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      source_site: tool.source_site,
      source_url: tool.source_url,
    })),
    matrix: [
      {
        dimension: "Price",
        values: tools.map((tool) => tool.price ?? "Not specified"),
      },
      {
        dimension: "Category",
        values: tools.map((tool) => tool.category ?? "Not specified"),
      },
      {
        dimension: "Rating",
        values: tools.map((tool) => tool.rating ?? "—"),
      },
      {
        dimension: "Source Site",
        values: tools.map((tool) => tool.source_site),
      },
      {
        dimension: "Tags",
        values: tools.map((tool) =>
          tool.tags.length > 0 ? tool.tags.join(", ") : "Not specified",
        ),
      },
    ],
  };
}

export function validateComparisonIds(input: unknown): string[] {
  if (!Array.isArray(input)) {
    throw new Error("ids must be an array.");
  }

  if (input.length < 1) {
    throw new Error("ids must include at least one item.");
  }

  if (input.length > MAX_BUILD_IDS) {
    throw new Error(`ids must include ${MAX_BUILD_IDS} items or fewer.`);
  }

  const ids = input.map((id) => (typeof id === "string" ? id.trim() : ""));
  const invalidId = ids.find((id) => !ID_PATTERN.test(id));
  if (invalidId !== undefined) {
    throw new Error("ids may only contain lowercase letters, numbers, and hyphens.");
  }

  return Array.from(new Set(ids));
}

function scoreRecord(record: ToolIndexRecord, query: string, terms: string[]): number {
  const name = normalizeText(record.name);
  const description = normalizeText(record.description);
  const tags = record.tags.map(normalizeText);

  let score = 0;

  if (name === query) score += 1000;
  if (name.startsWith(query)) score += 800;
  if (name.includes(query)) score += 600;

  if (tags.some((tag) => tag === query)) score += 500;
  if (tags.some((tag) => tag.includes(query) || query.includes(tag))) score += 350;

  if (description.includes(query)) score += 200;

  for (const term of terms) {
    if (name.includes(term)) score += 80;
    if (tags.some((tag) => tag.includes(term))) score += 60;
    if (description.includes(term)) score += 25;
  }

  return score;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
