import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PriceTrackerTable } from "@/components/PriceTrackerTable";
import { getPriceTrackerRecords, getPriceTrackerStats } from "@/lib/priceTracker";
import {
  getPriceTrackerSegment,
  getPriceTrackerSegmentRecords,
  priceTrackerBaseUrl,
  priceTrackerSegments,
} from "@/lib/priceTrackerSegments";

type PriceTrackerSegmentPageProps = {
  params: {
    segment: string;
  };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return priceTrackerSegments.map((segment) => ({ segment: segment.slug }));
}

export function generateMetadata({ params }: PriceTrackerSegmentPageProps): Metadata {
  const segment = getPriceTrackerSegment(params.segment);
  if (!segment) {
    return {};
  }

  const url = `${priceTrackerBaseUrl}/${segment.slug}`;

  return {
    title: segment.title,
    description: segment.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: segment.title,
      description: segment.description,
      url,
      siteName: "Tools App",
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: segment.title,
      description: segment.description,
      images: ["/og-default.png"],
    },
  };
}

export default function PriceTrackerSegmentPage({ params }: PriceTrackerSegmentPageProps) {
  const segment = getPriceTrackerSegment(params.segment);
  if (!segment) {
    notFound();
  }

  const records = getPriceTrackerSegmentRecords(getPriceTrackerRecords(), segment);
  const stats = getPriceTrackerStats(records);
  const structuredData = buildSegmentStructuredData(segment.slug, segment.heading, segment.description, records.length);

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
              href="/price-tracker"
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              AI Tool Price Tracker
            </a>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              {segment.heading}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              {segment.description}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {segment.searchIntent} These are indexed metadata signals, not live vendor prices.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Segment coverage</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Signals</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-950">{stats.total}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Sources</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-950">{stats.sources}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Kinds</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-950">{segment.priceKinds.length}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Updated from</dt>
                <dd className="mt-1 text-sm font-semibold leading-7 text-slate-950">Content index</dd>
              </div>
            </dl>
          </div>
        </section>

        <PriceTrackerTable records={records} />
      </div>
    </main>
  );
}

function buildSegmentStructuredData(
  slug: string,
  heading: string,
  description: string,
  recordCount: number,
) {
  const url = `${priceTrackerBaseUrl}/${slug}`;

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
        mainEntity: {
          "@type": "ItemList",
          name: heading,
          numberOfItems: recordCount,
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
            name: "AI Tool Price Tracker",
            item: priceTrackerBaseUrl,
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
