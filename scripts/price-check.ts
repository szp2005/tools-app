import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type PriceSource = {
  id: string;
  name: string;
  category: string;
  url: string;
};

type PriceSourcePayload = {
  schema_version: "1";
  cron_enabled: boolean;
  sources: PriceSource[];
};

type PriceSnapshot = {
  id: string;
  name: string;
  category: string;
  url: string;
  checked_at: string;
  status: number | "error";
  price_text: string;
  fingerprint: string;
  error?: string;
};

type PriceChangePayload = {
  schema_version: "1";
  generated_at: string;
  source: string;
  records: Array<Record<string, unknown>>;
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, "..");
const dataDir = path.join(rootDir, "data");
const sourcesPath = path.join(dataDir, "price-sources.json");
const snapshotsPath = path.join(dataDir, "price-snapshots.json");
const changesPath = path.join(dataDir, "price-changes.json");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sources = await readJson<PriceSourcePayload>(sourcesPath);
  const selectedSources = sources.sources.slice(0, args.limit ?? sources.sources.length);
  const previousSnapshots = new Map(
    (await readOptionalSnapshots()).map((snapshot) => [snapshot.id, snapshot]),
  );
  const checkedAt = new Date().toISOString();
  const snapshots: PriceSnapshot[] = [];
  const detectedChanges: Array<Record<string, unknown>> = [];

  for (const source of selectedSources) {
    const snapshot = await fetchSnapshot(source, checkedAt);
    const previous = previousSnapshots.get(source.id);

    snapshots.push(snapshot);

    if (
      previous &&
      previous.status !== "error" &&
      snapshot.status !== "error" &&
      previous.fingerprint !== snapshot.fingerprint
    ) {
      detectedChanges.push(buildDetectedChange(source, previous, snapshot));
    }
  }

  if (!args.dryRun) {
    await mkdir(dataDir, { recursive: true });
    await writeFile(snapshotsPath, `${JSON.stringify(snapshots, null, 2)}\n`, "utf8");

    if (detectedChanges.length > 0) {
      const existing = await readJson<PriceChangePayload>(changesPath);
      const seen = new Set(existing.records.map((record) => String(record.id)));
      const merged = [
        ...detectedChanges.filter((record) => !seen.has(String(record.id))),
        ...existing.records,
      ];

      await writeFile(
        changesPath,
        `${JSON.stringify(
          {
            ...existing,
            generated_at: checkedAt,
            source: "price-check",
            records: merged,
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
    }
  }

  const ok = snapshots.filter((snapshot) => snapshot.status !== "error").length;
  const failed = snapshots.length - ok;
  console.log(
    JSON.stringify(
      {
        dry_run: args.dryRun,
        cron_enabled: sources.cron_enabled,
        checked: snapshots.length,
        ok,
        failed,
        detected_changes: detectedChanges.length,
        snapshots_path: relative(snapshotsPath),
        changes_path: relative(changesPath),
      },
      null,
      2,
    ),
  );
}

function parseArgs(args: string[]) {
  const limitIndex = args.indexOf("--limit");
  const limit =
    limitIndex >= 0 && args[limitIndex + 1]
      ? Math.max(1, Number.parseInt(args[limitIndex + 1], 10))
      : undefined;

  return {
    dryRun: args.includes("--dry-run"),
    limit: Number.isFinite(limit) ? limit : undefined,
  };
}

async function fetchSnapshot(source: PriceSource, checkedAt: string): Promise<PriceSnapshot> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "user-agent": "ToolsAppPriceTracker/1.0 (+https://tools.toolrouteai.com/price-tracker)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const text = await response.text();
    clearTimeout(timeout);
    const priceText = extractPriceText(text);

    return {
      id: source.id,
      name: source.name,
      category: source.category,
      url: source.url,
      checked_at: checkedAt,
      status: response.status,
      price_text: priceText,
      fingerprint: fingerprint(priceText || text.slice(0, 2000)),
    };
  } catch (error) {
    return {
      id: source.id,
      name: source.name,
      category: source.category,
      url: source.url,
      checked_at: checkedAt,
      status: "error",
      price_text: "",
      fingerprint: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function buildDetectedChange(
  source: PriceSource,
  previous: PriceSnapshot,
  current: PriceSnapshot,
) {
  const date = current.checked_at.slice(0, 10);

  return {
    id: `${source.id}-${date}-${current.fingerprint.slice(0, 8)}`,
    tool: source.name,
    category: source.category,
    change_type: "feature_change",
    changed_at: date,
    previous_price: previous.price_text || "Previous price text unavailable",
    current_price: current.price_text || "Current price text unavailable",
    summary: `${source.name} pricing page changed from the previous monitored snapshot.`,
    source_url: source.url,
    evidence_url: source.url,
    impact_score: 30,
    detected_by: "price-check",
  };
}

function extractPriceText(html: string) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const dollarMatches = text.match(/\$\s?\d[\d,.]*(?:\s?(?:\/|per)\s?(?:mo|month|user|seat|year|yr|credit))?/gi) ?? [];
  const freeMatches = /\bfree\b/i.test(text) ? ["Free"] : [];
  const enterpriseMatches = /\benterprise\b/i.test(text) ? ["Enterprise"] : [];
  const unique = Array.from(new Set([...freeMatches, ...dollarMatches, ...enterpriseMatches]));

  return unique.slice(0, 12).join(" | ");
}

function fingerprint(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function readOptionalSnapshots(): Promise<PriceSnapshot[]> {
  try {
    return (await readJson<PriceSnapshot[]>(snapshotsPath)) ?? [];
  } catch {
    return [];
  }
}

function relative(filePath: string) {
  return path.relative(process.cwd(), filePath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
