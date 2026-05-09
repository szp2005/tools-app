import type { Metadata } from "next";
import { PriceTrackerTable } from "@/components/PriceTrackerTable";
import { getPriceTrackerRecords, getPriceTrackerStats } from "@/lib/priceTracker";
import { getPriceTrackerSegmentRecords, priceTrackerSegments } from "@/lib/priceTrackerSegments";

const pageUrl = "https://tools.toolrouteai.com/price-tracker";
const pageTitle = "AI Tool Price Tracker | Tools App";
const pageDescription =
  "Search indexed AI tool price signals from the Tools App content portfolio. Built from article metadata with no crawler or LLM cost.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "AI tool price tracker",
    "AI software pricing",
    "AI tool cost comparison",
    "free AI tools",
    "AI tool index",
  ],
  alternates: {
    canonical: pageUrl,
    types: {
      "application/rss+xml": `${pageUrl}/feed.xml`,
      "application/json": `${pageUrl}/index.json`,
    },
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pageUrl,
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

export default function PriceTrackerPage() {
  const records = getPriceTrackerRecords();
  const stats = getPriceTrackerStats(records);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              AI Tool Price Tracker
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Search price signals pulled from the four-site content index. This is a lightweight
              metadata tracker, not a live crawler, so always verify pricing on the vendor page.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="/price-tracker/feed.xml"
                className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-950 hover:text-slate-950"
              >
                RSS feed
              </a>
              <a
                href="/price-tracker/index.json"
                className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-950 hover:text-slate-950"
              >
                JSON index
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Index coverage</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Price signals</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-950">{stats.total}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Sources</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-950">{stats.sources}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Free/open</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-950">{stats.free}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Monthly</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-950">{stats.monthly}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Browse by pricing model</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Use these index pages when you want a focused list of free, subscription, one-time,
              usage-based, or enterprise pricing signals.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {priceTrackerSegments.map((segment) => {
              const count = getPriceTrackerSegmentRecords(records, segment).length;

              return (
                <a
                  key={segment.slug}
                  href={`/price-tracker/${segment.slug}`}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-950 hover:bg-white"
                >
                  <span className="block text-sm font-semibold text-slate-950">{segment.heading}</span>
                  <span className="mt-1 block text-xs font-medium text-slate-500">{count} signals</span>
                </a>
              );
            })}
          </div>
        </section>

        <PriceTrackerTable records={records} />
      </div>
    </main>
  );
}
