import type { Metadata } from "next";
import { ComparisonBuilder } from "@/components/ComparisonBuilder";
import { comparisonPages } from "@/lib/comparisonPages";
import { buildSoftwareApplicationJsonLd } from "@/lib/seo";

const pageTitle = "AI Tool Comparison Builder | Tools App";
const pageDescription =
  "Compare AI tools by price, category, source, tags, and workflow fit, then export the comparison as Markdown or PDF.";
const pageUrl = "https://tools.toolrouteai.com/comparison";
const ogImage = "/og-comparison.png";

export const metadata: Metadata = {
  title: "AI Tool Comparison Builder | Tools App",
  description: pageDescription,
  keywords: [
    "AI tool comparison",
    "AI tools",
    "tool comparison table",
    "solopreneur AI tools",
    "creator workflow tools",
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pageUrl,
    siteName: "Tools App",
    images: [{ url: ogImage, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
};

export default function ComparisonPage() {
  const structuredData = buildSoftwareApplicationJsonLd({
    name: "AI Tool Comparison Builder",
    url: pageUrl,
    description: pageDescription,
    applicationCategory: "BusinessApplication",
    featureList: [
      "AI tool autocomplete",
      "Structured comparison matrix",
      "Markdown export",
      "PDF export",
      "Zero-API-cost content index search",
    ],
    keywords: metadata.keywords as string[],
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            AI Tool Comparison Builder
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Pick tools from the four-site content index and turn the source data into a clean comparison table.
          </p>
        </section>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Popular comparisons</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Start with a static comparison, then open the builder to create your own.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {comparisonPages.map((page) => (
              <a
                key={page.slug}
                href={`/comparison/${page.slug}`}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-950 hover:bg-white"
              >
                <span className="block text-sm font-semibold text-slate-950">{page.heading}</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
                  {page.ids.length} indexed sources
                </span>
              </a>
            ))}
          </div>
        </section>

        <ComparisonBuilder />
      </div>
    </main>
  );
}
