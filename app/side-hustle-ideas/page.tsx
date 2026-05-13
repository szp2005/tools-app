import type { Metadata } from "next";
import { SideHustleIdeasForm } from "@/components/SideHustleIdeasForm";

const pageTitle = "Side Hustle Ideas Generator | Tools App";
const pageDescription =
  "Generate three practical side-hustle ideas from your skills, weekly time, and starting budget.";
const pageUrl = "https://tools.toolrouteai.com/side-hustle-ideas";

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

export default function SideHustleIdeasPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
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
