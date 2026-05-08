"use client";

import { useMemo, useState } from "react";
import {
  buildObsidianTemplatePack,
  createTemplateFilename,
  obsidianScenarios,
  type ObsidianScenarioId,
} from "@/lib/obsidianTemplates";

export function ObsidianTemplateGenerator() {
  const [scenarioId, setScenarioId] = useState<ObsidianScenarioId>("project");
  const [vaultName, setVaultName] = useState("Solo OS");
  const [detailLevel, setDetailLevel] = useState<"lean" | "guided">("guided");
  const [copied, setCopied] = useState(false);

  const selectedScenario =
    obsidianScenarios.find((scenario) => scenario.id === scenarioId) ?? obsidianScenarios[0];

  const pack = useMemo(
    () => buildObsidianTemplatePack({ scenarioId, vaultName, detailLevel }),
    [detailLevel, scenarioId, vaultName],
  );

  function downloadPack() {
    const blob = new Blob([pack], { type: "text/markdown;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = createTemplateFilename({ scenarioId, vaultName, detailLevel });
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  async function copyPack() {
    try {
      await navigator.clipboard.writeText(pack);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="grid min-w-0 gap-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Choose a workflow</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Start with a scenario, then download a ready-to-paste Markdown pack.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {obsidianScenarios.map((scenario) => {
              const selected = scenario.id === scenarioId;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  data-testid={`template-scenario-${scenario.id}`}
                  onClick={() => setScenarioId(scenario.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-950 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-sm font-semibold">{scenario.name}</span>
                  <span className={`mt-1 block text-sm leading-6 ${selected ? "text-slate-200" : "text-slate-600"}`}>
                    {scenario.description}
                  </span>
                  <span className={`mt-3 block text-xs font-semibold ${selected ? "text-slate-300" : "text-slate-500"}`}>
                    {scenario.bestFor}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">Customize pack</h2>

          <label htmlFor="vault-name" className="mt-5 block text-sm font-medium text-slate-700">
            Vault or workspace name
          </label>
          <input
            id="vault-name"
            data-testid="vault-name"
            value={vaultName}
            onChange={(event) => setVaultName(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            placeholder="My Obsidian Vault"
          />

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-700">Detail level</p>
            <div className="mt-2 inline-flex rounded-md border border-slate-300 bg-slate-50 p-1">
              {(["guided", "lean"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  data-testid={`detail-${level}`}
                  aria-pressed={detailLevel === level}
                  onClick={() => setDetailLevel(level)}
                  className={`min-h-9 rounded px-4 text-sm font-semibold capitalize transition ${
                    detailLevel === level
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-md bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">Files included</p>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600">
              {selectedScenario.files.map((file) => (
                <li key={file} className="flex items-center justify-between gap-3">
                  <span>{file}</span>
                  <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-500">.md</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Template preview</h2>
            <p className="mt-1 text-sm text-slate-500">Generated locally in your browser. No API call.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={copyPack}
              className="min-h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-950 hover:text-slate-950"
            >
              {copied ? "Copied" : "Copy Markdown"}
            </button>
            <button
              type="button"
              data-testid="download-template-pack"
              onClick={downloadPack}
              className="min-h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Download .md pack
            </button>
          </div>
        </div>

        <textarea
          readOnly
          data-testid="template-preview"
          value={pack}
          className="min-h-[620px] w-full resize-y border-0 bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-100 outline-none sm:p-6"
          aria-label="Generated Obsidian template pack"
        />
      </div>
    </section>
  );
}
