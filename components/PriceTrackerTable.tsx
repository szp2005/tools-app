"use client";

import { useMemo, useState } from "react";
import type { PriceKind, PriceTrackerRecord } from "@/lib/priceTracker";
import { buildPriceTrackerCsv, createPriceTrackerCsvFilename } from "@/lib/priceTrackerCsv";

type PriceTrackerTableProps = {
  records: PriceTrackerRecord[];
};

const priceKinds: Array<"All" | PriceKind> = [
  "All",
  "Free",
  "Monthly",
  "Annual",
  "Usage-based",
  "Enterprise",
  "One-time",
  "Variable",
];

export function PriceTrackerTable({ records }: PriceTrackerTableProps) {
  const [query, setQuery] = useState("");
  const [priceKind, setPriceKind] = useState<"All" | PriceKind>("All");
  const [sourceSite, setSourceSite] = useState("all");

  const sourceOptions = useMemo(
    () => Array.from(new Set(records.map((record) => record.source_site))).sort(),
    [records],
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          record.name,
          record.description,
          record.price,
          record.category ?? "",
          record.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesKind = priceKind === "All" || record.price_kind === priceKind;
      const matchesSource = sourceSite === "all" || record.source_site === sourceSite;

      return matchesQuery && matchesKind && matchesSource;
    });
  }, [priceKind, query, records, sourceSite]);

  function downloadCsv() {
    const csv = buildPriceTrackerCsv(filteredRecords);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = createPriceTrackerCsvFilename();
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-950">Search tools, tags, or price notes</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pricing, free, local LLM, automation..."
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-950">Source</span>
            <select
              value={sourceSite}
              onChange={(event) => setSourceSite(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            >
              <option value="all">All sources</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {priceKinds.map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={priceKind === kind}
              onClick={() => setPriceKind(kind)}
              className={`min-h-9 rounded-md border px-3 text-sm font-semibold transition ${
                priceKind === kind
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-950 hover:text-slate-950"
              }`}
            >
              {kind}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-500">
            {filteredRecords.length} filtered price signals are ready for export.
          </p>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={filteredRecords.length === 0}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Tool or guide</th>
              <th className="px-4 py-3 font-semibold">Price signal</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="align-top">
                <td className="max-w-md px-4 py-4">
                  <a
                    href={record.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold leading-6 text-slate-950 transition hover:text-violet-700"
                  >
                    {record.name}
                  </a>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                    {record.description}
                  </p>
                </td>
                <td className="max-w-xs px-4 py-4 font-medium leading-6 text-slate-800">
                  {record.price}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {record.price_kind}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-slate-600">
                  {record.source_site}
                </td>
                <td className="max-w-xs px-4 py-4 text-xs leading-5 text-slate-500">
                  {record.tags.slice(0, 4).join(", ") || "Not specified"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRecords.length === 0 ? (
          <div className="border-t border-slate-200 p-6 text-sm text-slate-600">
            No price signals matched this filter.
          </div>
        ) : null}
      </div>

      <p className="text-sm leading-6 text-slate-500">
        Showing {filteredRecords.length} of {records.length} indexed price signals.
      </p>
    </section>
  );
}
