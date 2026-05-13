import Link from "next/link";
import { obsidianScenarioPages } from "./pageData";
import { obsidianScenarios, type ObsidianScenarioId } from "@/lib/obsidianTemplates";

const scenarioOrder: ObsidianScenarioId[] = obsidianScenarios.map((scenario) => scenario.id);

type ScenarioLinkRailProps = {
  activeScenarioId?: ObsidianScenarioId;
};

export function ScenarioLinkRail({ activeScenarioId }: ScenarioLinkRailProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Browse template packs</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Start from a dedicated workflow page, then customize the Markdown pack in the generator.
          </p>
        </div>
        <Link
          href="/obsidian-templates"
          className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          All templates
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {scenarioOrder.map((scenarioId) => {
          const page = obsidianScenarioPages[scenarioId];
          const isActive = scenarioId === activeScenarioId;

          return (
            <Link
              key={scenarioId}
              href={`/obsidian-templates/${scenarioId}`}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-lg border p-4 transition ${
                isActive
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-950 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="block text-sm font-semibold">{page.heading}</span>
              <span className={`mt-2 block text-sm leading-6 ${isActive ? "text-slate-200" : "text-slate-600"}`}>
                {page.description}
              </span>
              <span className={`mt-4 block text-sm font-semibold ${isActive ? "text-slate-100" : "text-slate-950"}`}>
                {isActive ? "Current pack" : "Open pack"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
