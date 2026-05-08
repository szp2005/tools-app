"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PdfOrientation } from "@/components/ComparisonPDF";

type SearchResult = {
  id: string;
  name: string;
  description: string;
  source_site: string;
  snippet: string;
};

type ComparisonTool = {
  id: string;
  name: string;
  source_site: string;
  source_url: string;
};

type MatrixRow = {
  dimension: string;
  values: string[];
};

type ComparisonResult = {
  tools: ComparisonTool[];
  matrix: MatrixRow[];
};

const maxSelections = 5;

export function ComparisonBuilder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedTools, setSelectedTools] = useState<SearchResult[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [pdfOrientation, setPdfOrientation] = useState<PdfOrientation>("landscape");
  const [isSearching, setIsSearching] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const canBuild = selectedTools.length >= 2 && !isBuilding;
  const selectedIds = useMemo(() => new Set(selectedTools.map((tool) => tool.id)), [selectedTools]);
  const availableResults = results.filter((result) => !selectedIds.has(result.id));

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/comparison/search?q=${encodeURIComponent(trimmedQuery)}&limit=10`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Search failed.");
        }

        const payload = (await response.json()) as SearchResult[];
        setResults(Array.isArray(payload) ? payload : []);
        setError(null);
      } catch (searchError) {
        if (!controller.signal.aborted) {
          setResults([]);
          setError(searchError instanceof Error ? searchError.message : "Search failed.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function selectTool(tool: SearchResult) {
    if (selectedTools.length >= maxSelections || selectedIds.has(tool.id)) {
      return;
    }

    setSelectedTools((tools) => [...tools, tool]);
    setComparison(null);
    setQuery("");
    setResults([]);
    setIsMenuOpen(false);
  }

  function removeTool(id: string) {
    setSelectedTools((tools) => tools.filter((tool) => tool.id !== id));
    setComparison(null);
  }

  async function buildComparison() {
    if (!canBuild) {
      return;
    }

    setIsBuilding(true);
    setError(null);

    try {
      const response = await fetch("/api/comparison/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedTools.map((tool) => tool.id) }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Comparison failed.");
      }

      setComparison(payload as ComparisonResult);
    } catch (buildError) {
      setComparison(null);
      setError(buildError instanceof Error ? buildError.message : "Comparison failed.");
    } finally {
      setIsBuilding(false);
    }
  }

  function downloadMarkdown() {
    if (!comparison) {
      return;
    }

    const markdown = createMarkdownTable(comparison);
    const filename = createComparisonFilename(comparison, "md");
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });

    downloadBlob(blob, filename);
  }

  async function downloadPdf() {
    if (!comparison || isPdfGenerating) {
      return;
    }

    setIsPdfGenerating(true);
    setError(null);

    try {
      const [{ pdf }, { ComparisonPDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/ComparisonPDF"),
      ]);
      const blob = await pdf(
        <ComparisonPDFDocument comparison={comparison} orientation={pdfOrientation} />,
      ).toBlob();
      const filename = createComparisonFilename(comparison, "pdf");

      downloadBlob(blob, filename);
    } catch (pdfError) {
      setError(pdfError instanceof Error ? pdfError.message : "PDF export failed.");
    } finally {
      setIsPdfGenerating(false);
    }
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <section className="grid min-w-0 gap-6">
      <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Choose tools</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Search the content index, select 2 to 5 tools, then build a comparison matrix.
            </p>
          </div>
          <p className="text-xs font-medium text-slate-500">{selectedTools.length}/5 selected</p>
        </div>

        <div ref={searchBoxRef} className="relative mt-5">
          <label htmlFor="comparison-search" className="sr-only">
            Search tools
          </label>
          <input
            id="comparison-search"
            data-testid="comparison-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsMenuOpen(true);
            }}
            onFocus={() => setIsMenuOpen(true)}
            disabled={selectedTools.length >= maxSelections}
            placeholder="Search tools, e.g. midjourney or AI writing"
            className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            autoComplete="off"
          />

          {isMenuOpen && query.trim().length >= 2 ? (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
              {isSearching ? (
                <p className="px-4 py-4 text-sm text-slate-500">Searching...</p>
              ) : availableResults.length > 0 ? (
                <ul className="divide-y divide-slate-100" role="listbox">
                  {availableResults.map((result) => (
                    <li key={result.id}>
                      <button
                        type="button"
                        data-testid="comparison-option"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectTool(result)}
                        className="flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                      >
                        <span className="text-sm font-semibold text-slate-950">{result.name}</span>
                        <span className="line-clamp-2 text-xs leading-5 text-slate-600">
                          {result.description}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {result.source_site}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-4 text-sm text-slate-500">No matching tools found.</p>
              )}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex min-w-0 flex-wrap gap-2">
          {selectedTools.length > 0 ? (
            selectedTools.map((tool) => (
              <span
                key={tool.id}
                className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
              >
                <span className="min-w-0 truncate">{tool.name}</span>
                <button
                  type="button"
                  onClick={() => removeTool(tool.id)}
                  className="grid h-5 w-5 flex-none place-items-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-950"
                  aria-label={`Remove ${tool.name}`}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">No tools selected yet.</p>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold text-slate-950">Build comparison</p>
          <p className="mt-1 text-sm text-slate-500">Select at least two tools to generate the table.</p>
        </div>
        <button
          type="button"
          data-testid="comparison-build"
          onClick={buildComparison}
          disabled={!canBuild}
          className="min-h-11 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isBuilding ? "Building..." : "Build comparison"}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      {comparison ? (
        <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Comparison table</h2>
              <p className="mt-1 text-sm text-slate-500">
                Generated from the four-site content index. No paid API call used.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 p-1" aria-label="PDF layout">
                {(["landscape", "portrait"] as const).map((orientation) => (
                  <button
                    key={orientation}
                    type="button"
                    data-testid={`pdf-orientation-${orientation}`}
                    aria-pressed={pdfOrientation === orientation}
                    onClick={() => setPdfOrientation(orientation)}
                    className={`min-h-8 rounded px-3 text-xs font-semibold capitalize transition ${
                      pdfOrientation === orientation
                        ? "bg-slate-950 text-white"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    }`}
                  >
                    {orientation}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  data-testid="download-markdown"
                  onClick={downloadMarkdown}
                  className="min-h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-950 hover:text-slate-950"
                >
                  Download as Markdown
                </button>
                <button
                  type="button"
                  data-testid="download-pdf"
                  onClick={downloadPdf}
                  disabled={isPdfGenerating}
                  className="min-h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400"
                >
                  {isPdfGenerating ? "Generating PDF..." : "Download as PDF"}
                </button>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto" data-testid="comparison-table-scroll">
            <table className="min-w-[760px] w-full border-collapse text-left text-sm" data-testid="comparison-table">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="w-40 px-4 py-4 font-semibold text-slate-950">Dimension</th>
                  {comparison.tools.map((tool) => (
                    <th key={tool.id} className="min-w-56 px-4 py-4 align-top font-semibold text-slate-950">
                      <a
                        href={tool.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="transition hover:text-violet-700"
                      >
                        {tool.name}
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.matrix.map((row) => (
                  <tr key={row.dimension} className="border-b border-slate-100 last:border-b-0">
                    <th className="px-4 py-4 align-top font-semibold text-slate-700">{row.dimension}</th>
                    {row.values.map((value, index) => (
                      <td
                        key={`${row.dimension}-${comparison.tools[index]?.id ?? index}`}
                        className="px-4 py-4 align-top leading-6 text-slate-600"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function createComparisonFilename(comparison: ComparisonResult, extension: "md" | "pdf") {
  return `comparison-${slugify(comparison.tools[0]?.name ?? "tool")}-vs-${slugify(
    comparison.tools[1]?.name ?? "tool",
  )}.${extension}`;
}

function createMarkdownTable(comparison: ComparisonResult) {
  const header = ["Dimension", ...comparison.tools.map((tool) => `[${tool.name}](${tool.source_url})`)];
  const separator = header.map(() => "---");
  const rows = comparison.matrix.map((row) => [row.dimension, ...row.values]);
  const table = [header, separator, ...rows]
    .map((row) => `| ${row.map(escapeMarkdownCell).join(" | ")} |`)
    .join("\n");

  return `# AI Tool Comparison\n\n${table}\n`;
}

function escapeMarkdownCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n+/g, " ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
