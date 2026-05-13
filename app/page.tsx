import Link from "next/link";
import { SubscribeWidget } from "@/components/SubscribeWidget";

const toolCards = [
  {
    name: "Prompt Optimizer",
    description: "Turn rough instructions into structured prompts for ChatGPT, Claude, and Gemini.",
    status: "Available",
    href: "/prompt-optimizer",
  },
  {
    name: "Comparison Builder",
    description: "Compare AI tools by use case, price, and workflow fit.",
    status: "Available",
    href: "/comparison",
  },
  {
    name: "Obsidian Template Generator",
    description: "Generate practical templates for notes, projects, and PKM workflows.",
    status: "Available",
    href: "/obsidian-templates",
  },
  {
    name: "Price Tracker",
    description: "Search indexed AI tool price signals from the content portfolio.",
    status: "MVP",
    href: "/price-tracker",
  },
];

const obsidianScenarioLinks = [
  {
    name: "Academic research templates",
    description: "Literature notes, research dashboards, and synthesis workflows.",
    href: "/obsidian-templates/academic",
  },
  {
    name: "Project management templates",
    description: "Project dashboards, decision logs, weekly reviews, and operator workflows.",
    href: "/obsidian-templates/project",
  },
  {
    name: "Reading notes templates",
    description: "Book notes, article capture, and idea distillation for creators.",
    href: "/obsidian-templates/reading",
  },
  {
    name: "Creative workflow templates",
    description: "Idea capture, draft briefs, publishing checklists, and retrospectives.",
    href: "/obsidian-templates/creative",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-center px-5 pb-12 pt-16 sm:px-8 lg:pb-16">
        <div className="max-w-4xl">
          <h1 className="text-5xl font-semibold tracking-normal sm:text-6xl">
            Free AI tools for solopreneurs and creators
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Open-source prompt optimizer + weekly digest. No signup required to use.
          </p>
          <SubscribeWidget variant="hero" source="hero" />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {toolCards.map((tool) => {
              const isAvailable = tool.status === "Available" || tool.status === "MVP";
              const cardContent = (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-950">{tool.name}</h2>
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                        isAvailable
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tool.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{tool.description}</p>
                  <p className="mt-8 text-sm font-semibold text-slate-950">
                    {tool.href ? "Open tool" : "Preview locked"}
                  </p>
                </>
              );

              return tool.href ? (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  {cardContent}
                </Link>
              ) : (
                <article
                  key={tool.name}
                  data-disabled="true"
                  className="rounded-lg border border-slate-200 bg-white p-5 opacity-70 shadow-sm"
                >
                  {cardContent}
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Obsidian template packs</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Jump straight into a workflow-specific Markdown pack.
                </p>
              </div>
              <Link
                href="/obsidian-templates"
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                Open generator
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {obsidianScenarioLinks.map((scenario) => (
                <Link
                  key={scenario.href}
                  href={scenario.href}
                  className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="block text-sm font-semibold text-slate-950">{scenario.name}</span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{scenario.description}</span>
                  <span className="mt-4 block text-sm font-semibold text-slate-950">Open pack</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="text-2xl font-semibold text-slate-950">Why this exists</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Tools App is a small open-source toolkit built while growing a one-person media business. Each tool solves a real workflow problem first, then turns into a free public resource for creators, operators, and solopreneurs who want useful AI help without another signup wall.
          </p>
        </div>
      </section>
    </main>
  );
}
