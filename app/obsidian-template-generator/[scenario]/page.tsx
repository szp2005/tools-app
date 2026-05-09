import { ObsidianTemplateGenerator } from "@/components/ObsidianTemplateGenerator";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getObsidianScenario, type ObsidianScenarioId } from "@/lib/obsidianTemplates";
import {
  buildGuidesByScenario,
  isObsidianScenarioId,
  obsidianScenarioPages,
  obsidianTemplatePageUrl,
} from "../pageData";
import { ScenarioLinkRail } from "../ScenarioLinkRail";

type ScenarioPageProps = {
  params: {
    scenario: string;
  };
};

export function generateStaticParams() {
  return Object.keys(obsidianScenarioPages).map((scenario) => ({ scenario }));
}

export function generateMetadata({ params }: ScenarioPageProps): Metadata {
  if (!isObsidianScenarioId(params.scenario)) {
    return {};
  }

  const page = obsidianScenarioPages[params.scenario];

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.url,
      siteName: "Tools App",
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/og-default.png"],
    },
  };
}

export default function ObsidianTemplateScenarioPage({ params }: ScenarioPageProps) {
  const scenarioId = params.scenario;

  if (!isObsidianScenarioId(scenarioId)) {
    notFound();
  }

  const page = obsidianScenarioPages[scenarioId];
  const scenario = getObsidianScenario(scenarioId);
  const structuredData = buildScenarioStructuredData(scenarioId);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            {page.heading}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            {page.description}
          </p>
        </section>

        <ScenarioLinkRail activeScenarioId={scenarioId} />

        <ObsidianTemplateGenerator
          guidesByScenario={buildGuidesByScenario()}
          initialScenarioId={scenarioId}
        />

        <section className="border-t border-slate-200 pt-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Files in this pack</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Download the whole pack or grab individual Markdown files from the generator above.
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-slate-700">
                {scenario.files.map((filename) => (
                  <li key={filename} className="rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs">
                    {filename}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-950">Common questions</h2>
              <div className="mt-4 grid gap-4">
                {page.faq.map((item) => (
                  <div key={item.question}>
                    <h3 className="text-sm font-semibold text-slate-950">{item.question}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function buildScenarioStructuredData(scenarioId: ObsidianScenarioId) {
  const page = obsidianScenarioPages[scenarioId];
  const scenario = getObsidianScenario(scenarioId);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.heading,
        url: page.url,
        description: page.description,
        isPartOf: {
          "@type": "WebSite",
          name: "Tools App",
          url: "https://tools.toolrouteai.com",
        },
        about: {
          "@type": "Thing",
          name: scenario.name,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Tools App",
            item: "https://tools.toolrouteai.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Obsidian Template Generator",
            item: obsidianTemplatePageUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: page.heading,
            item: page.url,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `${page.heading} files`,
        itemListElement: scenario.files.map((filename, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: filename,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
