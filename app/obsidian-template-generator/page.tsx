import { ObsidianTemplateGenerator } from "@/components/ObsidianTemplateGenerator";
import { SubscribeWidget } from "@/components/SubscribeWidget";
import type { Metadata } from "next";
import { buildGuidesByScenario, obsidianTemplatePageUrl } from "./pageData";
import { ScenarioLinkRail } from "./ScenarioLinkRail";

const pageTitle = "Free Obsidian Template Generator | Tools App";
const pageDescription =
  "Generate practical Obsidian Markdown template packs for research, projects, reading notes, creative workflows, and PKM systems.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "Obsidian template generator",
    "Obsidian templates",
    "PKM templates",
    "Markdown template pack",
    "knowledge management workflow",
  ],
  alternates: {
    canonical: obsidianTemplatePageUrl,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: obsidianTemplatePageUrl,
    siteName: "Tools App",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/og-default.png"],
  },
};

export default function ObsidianTemplateGeneratorPage() {
  const structuredData = buildStructuredData();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Obsidian Template Generator
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Pick a workflow and preference, then download a clean Obsidian .zip pack for your vault.
          </p>
        </section>

        <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SubscribeWidget variant="inline" source="tool" />
        </section>

        <ScenarioLinkRail />

        <ObsidianTemplateGenerator guidesByScenario={buildGuidesByScenario()} />
      </div>
    </main>
  );
}

function buildStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Obsidian Template Generator",
        url: obsidianTemplatePageUrl,
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        description: pageDescription,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
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
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is the Obsidian Template Generator free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The generator runs in your browser and creates Markdown template packs without requiring a signup.",
            },
          },
          {
            "@type": "Question",
            name: "Which workflows are supported?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The generator supports academic research, project operating systems, and reading notes.",
            },
          },
        ],
      },
    ],
  };
}
