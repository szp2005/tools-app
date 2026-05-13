import obsidianIndex from "@/data/obsidian-index.json";
import { obsidianScenarios, type ObsidianScenarioId } from "@/lib/obsidianTemplates";

export const obsidianTemplatePageUrl = "https://tools.toolrouteai.com/obsidian-templates";

export const obsidianScenarioPages: Record<
  ObsidianScenarioId,
  {
    title: string;
    heading: string;
    description: string;
    url: string;
    image: string;
    faq: Array<{
      question: string;
      answer: string;
    }>;
  }
> = {
  academic: {
    title: "Academic Research Obsidian Templates | Tools App",
    heading: "Academic Research Obsidian Templates",
    description:
      "Download Obsidian Markdown templates for literature notes, source triage, research dashboards, and synthesis workflows.",
    url: `${obsidianTemplatePageUrl}/academic`,
    image: "/og-obsidian-academic.png",
    faq: [
      {
        question: "What is included in the academic research pack?",
        answer:
          "The pack includes a research dashboard, literature note, and synthesis note for turning sources into clearer arguments.",
      },
      {
        question: "Can I use these templates without an Obsidian plugin?",
        answer:
          "Yes. Each file is plain Markdown, so you can paste it into Obsidian, Logseq, VS Code, or any notes app that supports Markdown.",
      },
    ],
  },
  project: {
    title: "Project Management Obsidian Templates | Tools App",
    heading: "Project Management Obsidian Templates",
    description:
      "Download Obsidian Markdown templates for project dashboards, decision logs, weekly reviews, and operator workflows.",
    url: `${obsidianTemplatePageUrl}/project`,
    image: "/og-obsidian-project.png",
    faq: [
      {
        question: "What is included in the project management pack?",
        answer:
          "The pack includes a project dashboard, decision log, and weekly review template for running an operating rhythm from Markdown.",
      },
      {
        question: "Who is this pack best for?",
        answer:
          "It is built for founders, consultants, operators, and solo builders who want a lightweight project system inside Obsidian.",
      },
    ],
  },
  reading: {
    title: "Reading Notes Obsidian Templates | Tools App",
    heading: "Reading Notes Obsidian Templates",
    description:
      "Download Obsidian Markdown templates for book notes, article capture, idea distillation, and creator research workflows.",
    url: `${obsidianTemplatePageUrl}/reading`,
    image: "/og-obsidian-reading.png",
    faq: [
      {
        question: "What is included in the reading notes pack?",
        answer:
          "The pack includes a reading dashboard, book note, and idea distillation template for turning highlights into reusable ideas.",
      },
      {
        question: "Can newsletter writers use this pack?",
        answer:
          "Yes. The reading workflow is designed to help creators capture sources, extract ideas, and turn notes into future writing.",
      },
    ],
  },
  creative: {
    title: "Creative Workflow Obsidian Templates | Tools App",
    heading: "Creative Workflow Obsidian Templates",
    description:
      "Download Obsidian Markdown templates for idea capture, draft briefs, publishing checklists, and creative retrospectives.",
    url: `${obsidianTemplatePageUrl}/creative`,
    image: "/og-default.png",
    faq: [
      {
        question: "What is included in the creative workflow pack?",
        answer:
          "The pack includes a creative dashboard, idea capture note, draft brief, publishing checklist, and retrospective template.",
      },
      {
        question: "Can I use the pack for newsletters or video scripts?",
        answer:
          "Yes. The templates are intentionally channel-neutral, so they work for newsletters, blog posts, videos, or social content.",
      },
    ],
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
  return obsidianScenarios.some((scenario) => scenario.id === value);
}

export function buildGuidesByScenario() {
  const scenarios: ObsidianScenarioId[] = obsidianScenarios.map((scenario) => scenario.id);

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
