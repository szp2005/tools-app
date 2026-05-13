import type { Metadata } from "next";
import { SideHustleIdeasForm } from "@/components/SideHustleIdeasForm";
import { buildSoftwareApplicationJsonLd } from "@/lib/seo";

const pageTitle = "Side Hustle Ideas Generator | Tools App";
const pageDescription =
  "Generate three practical side-hustle ideas from your skills, weekly time, and starting budget, with tools, income ranges, and risks.";
const pageUrl = "https://tools.toolrouteai.com/side-hustle-ideas";
const ogImage = "/og-side-hustle-ideas.png";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "side hustle ideas",
    "AI side hustle generator",
    "solopreneur ideas",
    "creator business ideas",
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

export default function SideHustleIdeasPage() {
  const structuredData = buildSoftwareApplicationJsonLd({
    name: "Side Hustle Ideas Generator",
    url: pageUrl,
    description: pageDescription,
    applicationCategory: "BusinessApplication",
    featureList: [
      "Skill-based side-hustle ideas",
      "Weekly time and budget inputs",
      "Startup paths",
      "Tool recommendations",
      "Income ranges and risk notes",
    ],
    keywords: metadata.keywords as string[],
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Side Hustle Ideas Generator
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Choose a skill, weekly time budget, and starting capital. Get three practical ideas with a test path, tool stack, income range, and risk notes.
          </p>
        </section>

        <SideHustleIdeasForm />
      </div>
    </main>
  );
}
