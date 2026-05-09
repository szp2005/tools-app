import type { PriceTrackerRecord } from "./priceTracker";

const csvColumns: Array<{
  header: string;
  value: (record: PriceTrackerRecord) => string;
}> = [
  { header: "name", value: (record) => record.name },
  { header: "price", value: (record) => record.price },
  { header: "price_kind", value: (record) => record.price_kind },
  { header: "source_site", value: (record) => record.source_site },
  { header: "source_url", value: (record) => record.source_url },
  { header: "category", value: (record) => record.category ?? "" },
  { header: "pubDate", value: (record) => record.pubDate ?? "" },
  { header: "tags", value: (record) => record.tags.join("; ") },
  { header: "description", value: (record) => record.description },
];

export function buildPriceTrackerCsv(records: PriceTrackerRecord[]): string {
  const rows = [
    csvColumns.map((column) => column.header),
    ...records.map((record) => csvColumns.map((column) => column.value(record))),
  ];

  return `${rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n")}\n`;
}

export function createPriceTrackerCsvFilename(date = new Date()): string {
  const isoDate = date.toISOString().slice(0, 10);

  return `ai-tool-price-signals-${isoDate}.csv`;
}

function escapeCsvCell(value: string): string {
  const safeValue = /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : value;

  if (!/[",\n\r]/.test(safeValue)) {
    return safeValue;
  }

  return `"${safeValue.replace(/"/g, '""')}"`;
}
