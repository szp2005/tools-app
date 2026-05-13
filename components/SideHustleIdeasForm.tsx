"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";
import type {
  SideHustleBudget,
  SideHustleIdeasResult,
  SideHustleSkill,
  SideHustleTime,
} from "@/lib/sideHustle";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const skillOptions: Array<{ id: SideHustleSkill; label: string; description: string }> = [
  { id: "writing", label: "Writing", description: "Content, newsletters, research, proposals" },
  { id: "design", label: "Design", description: "Visual assets, templates, thumbnails" },
  { id: "programming", label: "Programming", description: "Automation, small apps, internal tools" },
  { id: "marketing", label: "Marketing", description: "Funnels, short-form tests, local growth" },
  { id: "operations", label: "Operations", description: "Process cleanup, documentation, admin systems" },
];

const timeOptions: Array<{ id: SideHustleTime; label: string }> = [
  { id: "5h", label: "5h/week" },
  { id: "10h", label: "10h/week" },
  { id: "20h", label: "20h/week" },
];

const budgetOptions: Array<{ id: SideHustleBudget; label: string }> = [
  { id: "0", label: "$0" },
  { id: "500", label: "$500" },
  { id: "5000", label: "$5,000" },
];

export function SideHustleIdeasForm() {
  const [skill, setSkill] = useState<SideHustleSkill>("writing");
  const [time, setTime] = useState<SideHustleTime>("10h");
  const [budget, setBudget] = useState<SideHustleBudget>("500");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [result, setResult] = useState<SideHustleIdeasResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = Boolean(TURNSTILE_SITE_KEY && turnstileToken && !isLoading);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/side-hustle-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill,
          time,
          budget,
          turnstileToken,
        }),
      });
      const data = (await response.json()) as SideHustleIdeasResult | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data && data.error ? data.error : "Could not generate ideas.");
      }

      setResult(data as SideHustleIdeasResult);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not generate ideas.");
    } finally {
      setIsLoading(false);
      setTurnstileToken("");
      setTurnstileKey((currentKey) => currentKey + 1);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Build your idea set</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Pick your current constraints. Claude Haiku returns three practical concepts with steps, risks, and tools.
          </p>
        </div>

        <div className="mt-6 grid gap-5">
          <div>
            <p className="text-sm font-semibold text-slate-950">Skill</p>
            <div className="mt-2 grid gap-2">
              {skillOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={skill === option.id}
                  onClick={() => setSkill(option.id)}
                  className={`rounded-md border px-4 py-3 text-left transition ${
                    skill === option.id
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-950 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className={`mt-1 block text-xs leading-5 ${skill === option.id ? "text-slate-200" : "text-slate-600"}`}>
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <SegmentedControl
            label="Weekly time"
            value={time}
            options={timeOptions}
            onChange={setTime}
          />
          <SegmentedControl
            label="Starting budget"
            value={budget}
            options={budgetOptions}
            onChange={setBudget}
          />

          {TURNSTILE_SITE_KEY ? (
            <Turnstile
              key={turnstileKey}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
              options={{
                theme: "light",
                size: "flexible",
              }}
            />
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Verification is not configured yet.
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="min-h-11 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "Generating..." : "Generate Ideas"}
          </button>
        </div>
      </form>

      <ResultView result={result} error={error} isLoading={isLoading} />
    </section>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={`min-h-10 rounded-md border px-3 text-sm font-semibold transition ${
              value === option.id
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-950 hover:text-slate-950"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultView({
  result,
  error,
  isLoading,
}: {
  result: SideHustleIdeasResult | null;
  error: string | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
          <p className="font-medium text-slate-950">Generating focused ideas...</p>
          <p className="mt-2 text-sm text-slate-500">Claude Haiku is matching constraints to testable offers.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[520px] rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
        <p className="font-semibold">Something needs attention</p>
        <p className="mt-2 text-sm leading-6">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[520px] rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-500">
        <p className="font-medium text-slate-700">Your three ideas will appear here.</p>
        <p className="mt-3 text-sm leading-6">
          Each card includes a startup path, tool recommendations, income range, and the main risks to watch.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {result.ideas.map((idea) => (
        <article key={idea.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{idea.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{idea.fit}</p>
            </div>
            <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
              {idea.income_range}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Startup path</h3>
              <ol className="mt-2 grid list-decimal gap-2 pl-5 text-sm leading-6 text-slate-600">
                {idea.startup_path.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-950">Tools</h3>
              <div className="mt-2 grid gap-2">
                {idea.tools.map((tool) => (
                  <a
                    key={`${idea.title}-${tool.name}`}
                    href={tool.amazon_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm transition hover:border-slate-300 hover:bg-white"
                  >
                    <span className="font-semibold text-slate-950">{tool.name}</span>
                    <span className="mt-1 block leading-5 text-slate-600">{tool.purpose}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-md bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-950">Risks</h3>
            <ul className="mt-2 grid gap-1 text-sm leading-6 text-amber-900">
              {idea.risks.map((risk) => (
                <li key={risk}>- {risk}</li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
