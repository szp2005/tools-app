import obsidianIndex from "@/data/obsidian-index.json";
import type { ObsidianScenarioId } from "@/lib/obsidianTemplates";

export const obsidianTemplatePageUrl = "https://tools.toolrouteai.com/obsidian-template-generator";

export const obsidianScenarioPages: Record<
  ObsidianScenarioId,
  {
    title: string;
    heading: string;
    description: string;
    url: string;
  }
> = {
  academic: {
    title: "Academic Research Obsidian Templates | Tools App",
    heading: "Academic Research Obsidian Templates",
    description:
      "Download Obsidian Markdown templates for literature notes, source triage, research dashboards, and synthesis workflows.",
    url: `${obsidianTemplatePageUrl}/academic`,
  },
  project: {
    title: "Project Management Obsidian Templates | Tools App",
    heading: "Project Management Obsidian Templates",
    description:
      "Download Obsidian Markdown templates for project dashboards, decision logs, weekly reviews, and operator workflows.",
    url: `${obsidianTemplatePageUrl}/project`,
  },
  reading: {
    title: "Reading Notes Obsidian Templates | Tools App",
    heading: "Reading Notes Obsidian Templates",
    description:
      "Download Obsidian Markdown templates for book notes, article capture, idea distillation, and creator research workflows.",
    url: `${obsidianTemplatePageUrl}/reading`,
  },
};

export type ObsidianIndexRecord = {
  id: string;
  title: string;
  description: string;
  source_site: string;
  source_url: string;
  scenarios: ObsidianScenarioId[];
  pubDate?: string;
};

export function isObsidianScenarioId(value: string | undefined): value is ObsidianScenarioId {
  return value === "academic" || value === "project" || value === "reading";
}

export function buildGuidesByScenario() {
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
  ) as Record<
    ObsidianScenarioId,
    Array<Pick<ObsidianIndexRecord, "id" | "title" | "description" | "source_site" | "source_url">>
  >;
}
