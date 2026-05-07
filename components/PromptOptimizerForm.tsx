"use client";

import { useMemo, useState } from "react";
import { ResultPanel } from "./ResultPanel";
import type { OptimizeResult } from "@/lib/types";

const SAMPLE_PROMPT = "tell me about AI";

function buildChatLinks(prompt: string) {
  const encoded = encodeURIComponent(prompt);

  return [
    {
      name: "Try with ChatGPT",
      href: `https://chatgpt.com/?q=${encoded}`,
    },
    {
      name: "Try with Claude",
      href: `https://claude.ai/new?q=${encoded}`,
    },
    {
      name: "Try with Gemini",
      href: `https://gemini.google.com/app?q=${encoded}`,
    },
  ];
}

export function PromptOptimizerForm() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activePrompt = result?.optimized || prompt;
  const chatLinks = useMemo(() => buildChatLinks(activePrompt), [activePrompt]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCopied(false);

    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length < 3) {
      setError("Please enter a prompt with at least 3 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          turnstileToken: "",
        }),
      });

      const data = (await response.json()) as OptimizeResult | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data && data.error ? data.error : "The optimizer could not complete this request.");
      }

      setResult(data as OptimizeResult);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The optimizer could not complete this request.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.optimized) {
      return;
    }

    await navigator.clipboard.writeText(result.optimized);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Input prompt</h2>
            <p className="mt-1 text-sm text-slate-500">Paste a rough prompt and get a sharper version.</p>
          </div>
          <button
            type="button"
            onClick={() => setPrompt(SAMPLE_PROMPT)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Use sample
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="mt-5 min-h-[300px] w-full resize-y rounded-md border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          maxLength={4000}
          placeholder="Example: tell me about AI"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">{prompt.length}/4000 characters</p>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "Optimizing..." : "Optimize Prompt"}
          </button>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {chatLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              {link.name}
            </a>
          ))}
        </div>
      </form>

      <ResultPanel result={result} error={error} isLoading={isLoading} onCopy={handleCopy} copied={copied} />
    </div>
  );
}
