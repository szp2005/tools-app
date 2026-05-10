import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildStaticComparisonPage,
  comparisonBaseUrl,
  comparisonPages,
  getComparisonPage,
} from "@/lib/comparisonPages";

type ComparisonPairPageProps = {
  params: {
    pair: string;
  };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return comparisonPages.map((page) => ({ pair: page.slug }));
}

export function generateMetadata({ params }: ComparisonPairPageProps): Metadata {
  const page = getComparisonPage(params.pair);
  if (!page) {
    return {};
  }

  const url = `${comparisonBaseUrl}/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
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

export default function ComparisonPairPage({ params }: ComparisonPairPageProps) {
  const page = getComparisonPage(params.pair);
  if (!page) {
    notFound();
  }

  const comparison = buildStaticComparisonPage(page);
  const structuredData = buildComparisonStructuredData(page.slug, page.heading, page.description);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="max-w-3xl">
            <a
              href="/comparison"
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              AI Tool Comparison Builder
            </a>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              {page.heading}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              {page.description}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This static page uses the same content index as the interactive builder. Use the builder
              to compare any 2 to 5 indexed tools.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Comparison sources</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Tools</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-950">{comparison.tools.length}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Dimensions</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-950">{comparison.matrix.length}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">Sources</dt>
                <dd className="mt-1 text-sm font-semibold leading-6 text-slate-950">
                  {Array.from(new Set(comparison.tools.map((tool) => tool.source_site))).join(", ")}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[760px] w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Dimension</th>
                {comparison.tools.map((tool) => (
                  <th key={tool.id} className="px-4 py-3 font-semibold">
                    <a
                      href={tool.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="normal-case tracking-normal text-slate-950 transition hover:text-violet-700"
                    >
                      {tool.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {comparison.matrix.map((row) => (
                <tr key={row.dimension} className="align-top">
                  <th className="px-4 py-4 text-sm font-semibold text-slate-950">{row.dimension}</th>
                  {row.values.map((value, index) => (
                    <td key={`${row.dimension}-${index}`} className="max-w-md px-4 py-4 leading-6 text-slate-700">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Build another comparison</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Search the full four-site index, select 2 to 5 tools, then download the result as Markdown or PDF.
          </p>
          <a
            href="/comparison"
            className="mt-4 inline-flex min-h-10 items-center rounded-md border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open Comparison Builder
          </a>
        </section>
      </div>
    </main>
  );
}

function buildComparisonStructuredData(slug: string, heading: string, description: string) {
  const url = `${comparisonBaseUrl}/${slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: heading,
        url,
        description,
        isPartOf: {
          "@type": "WebSite",
          name: "Tools App",
          url: "https://tools.toolrouteai.com",
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
            name: "AI Tool Comparison Builder",
            item: comparisonBaseUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: heading,
            item: url,
          },
        ],
      },
    ],
  };
}
