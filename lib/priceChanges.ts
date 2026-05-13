import priceChanges from "../data/price-changes.json";
import priceSources from "../data/price-sources.json";

export type PriceChangeType = "increase" | "decrease" | "new_tier" | "feature_change";

export type PriceChangeRecord = {
  id: string;
  tool: string;
  category: string;
  change_type: PriceChangeType;
  changed_at: string;
  previous_price: string;
  current_price: string;
  summary: string;
  source_url: string;
  evidence_url: string;
  impact_score: number;
  detected_by: string;
};

export type PriceChangePayload = {
  schema_version: "1";
  generated_at: string;
  source_count: number;
  cron_enabled: boolean;
  recent_window_days: number;
  stats: {
    total: number;
    recent: number;
    increases: number;
    decreases: number;
  };
  records: PriceChangeRecord[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_DAYS = 30;

export function getPriceChangeRecords(): PriceChangeRecord[] {
  return [...(priceChanges.records as PriceChangeRecord[])].sort((a, b) => {
    const dateOrder = b.changed_at.localeCompare(a.changed_at);
    if (dateOrder !== 0) return dateOrder;

    return b.impact_score - a.impact_score;
  });
}

export function getRecentPriceChanges(
  days = DEFAULT_WINDOW_DAYS,
  now = new Date(),
): PriceChangeRecord[] {
  const nowTime = startOfDay(now).getTime();

  return getPriceChangeRecords().filter((record) => {
    const changedTime = startOfDay(new Date(record.changed_at)).getTime();
    const ageDays = (nowTime - changedTime) / DAY_MS;

    return ageDays >= 0 && ageDays <= days;
  });
}

export function getTopPriceIncreases(
  days = DEFAULT_WINDOW_DAYS,
  now = new Date(),
): PriceChangeRecord[] {
  return getRecentPriceChanges(days, now)
    .filter((record) => record.change_type === "increase")
    .sort(byImpact)
    .slice(0, 10);
}

export function getTopPriceDecreases(
  days = DEFAULT_WINDOW_DAYS,
  now = new Date(),
): PriceChangeRecord[] {
  return getRecentPriceChanges(days, now)
    .filter((record) => record.change_type === "decrease")
    .sort(byImpact)
    .slice(0, 10);
}

export function buildPriceChangePayload(
  days = DEFAULT_WINDOW_DAYS,
  generatedAt = new Date(),
): PriceChangePayload {
  const records = getPriceChangeRecords();
  const recent = getRecentPriceChanges(days, generatedAt);

  return {
    schema_version: "1",
    generated_at: generatedAt.toISOString(),
    source_count: priceSources.sources.length,
    cron_enabled: priceSources.cron_enabled,
    recent_window_days: days,
    stats: {
      total: records.length,
      recent: recent.length,
      increases: recent.filter((record) => record.change_type === "increase").length,
      decreases: recent.filter((record) => record.change_type === "decrease").length,
    },
    records,
  };
}

function byImpact(a: PriceChangeRecord, b: PriceChangeRecord) {
  if (b.impact_score !== a.impact_score) return b.impact_score - a.impact_score;

  return b.changed_at.localeCompare(a.changed_at);
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
