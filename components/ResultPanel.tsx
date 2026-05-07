import type { OptimizeResult } from "@/lib/types";

type ResultPanelProps = {
  result: OptimizeResult | null;
  error: string | null;
  isLoading: boolean;
  onCopy: () => void;
  copied: boolean;
};

export function ResultPanel({ result, error, isLoading, onCopy, copied }: ResultPanelProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
          <p className="font-medium text-slate-950">Optimizing your prompt...</p>
          <p className="mt-2 text-sm text-slate-500">Claude Haiku is tightening the structure and output rules.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[360px] rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
        <p className="font-semibold">Something needs attention</p>
        <p className="mt-2 text-sm leading-6">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[360px] rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-500">
        <p className="font-medium text-slate-700">Your optimized prompt will appear here.</p>
        <p className="mt-3 text-sm leading-6">
          It will include a paste-ready rewrite plus a short list of the changes that make the prompt easier for AI tools to follow.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-950">Optimized prompt</h2>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {copied ? "Copied" : "Copy to Clipboard"}
        </button>
      </div>

      <div className="p-5">
        <pre className="max-h-[420px] overflow-auto rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code>{result.optimized}</code>
        </pre>

        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Improvements</h3>
          <ul className="mt-3 space-y-3">
            {result.improvements.map((improvement) => (
              <li key={improvement} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
