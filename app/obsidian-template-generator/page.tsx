import { ObsidianTemplateGenerator } from "@/components/ObsidianTemplateGenerator";
import obsidianIndex from "@/data/obsidian-index.json";
import type { ObsidianScenarioId } from "@/lib/obsidianTemplates";

export const metadata = {
  title: "Obsidian Template Generator | Tools App",
  description:
    "Generate practical Obsidian Markdown template packs for research, project management, and reading workflows.",
  keywords: [
    "Obsidian template generator",
    "Obsidian templates",
    "PKM templates",
    "Markdown template pack",
    "knowledge management workflow",
  ],
};

export default function ObsidianTemplateGeneratorPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Obsidian Template Generator
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Pick a workflow and download a clean Markdown template pack for your vault.
          </p>
        </section>

        <ObsidianTemplateGenerator guidesByScenario={buildGuidesByScenario()} />
      </div>
    </main>
  );
}

type ObsidianIndexRecord = {
  id: string;
  title: string;
  description: string;
  source_site: string;
  source_url: string;
  scenarios: ObsidianScenarioId[];
  pubDate?: string;
};

function buildGuidesByScenario() {
  const scenarios: ObsidianScenarioId[] = ["academic", "project", "reading"];

  return Object.fromEntries(
    scenarios.map((scenario) => [
      scenario,
      (obsidianIndex as ObsidianIndexRecord[])
        .filter((record) => record.scenarios.includes(scenario))
        .sort((a, b) => {
          const primaryOrder = Number(b.scenarios[0] === scenario) - Number(a.scenarios[0] === scenario);
          if (primaryOrder !== 0) return primaryOrder;

          return (b.pubDate ?? "").localeCompare(a.pubDate ?? "");
        })
        .slice(0, 4)
        .map(({ id, title, description, source_site, source_url }) => ({
          id,
          title,
          description,
          source_site,
          source_url,
        })),
    ]),
  ) as Record<ObsidianScenarioId, Array<Pick<ObsidianIndexRecord, "id" | "title" | "description" | "source_site" | "source_url">>>;
}
