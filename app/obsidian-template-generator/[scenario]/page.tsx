import { ObsidianTemplateGenerator } from "@/components/ObsidianTemplateGenerator";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildGuidesByScenario,
  isObsidianScenarioId,
  obsidianScenarioPages,
} from "../pageData";

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
  if (!isObsidianScenarioId(params.scenario)) {
    notFound();
  }

  const page = obsidianScenarioPages[params.scenario];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            {page.heading}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            {page.description}
          </p>
        </section>

        <ObsidianTemplateGenerator
          guidesByScenario={buildGuidesByScenario()}
          initialScenarioId={params.scenario}
        />
      </div>
    </main>
  );
}
