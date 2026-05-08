import { ComparisonBuilder } from "@/components/ComparisonBuilder";

export const metadata = {
  title: "AI Tool Comparison Builder | Tools App",
  description:
    "Compare AI tools from the Tools App content index by price, category, rating, source, and tags.",
  keywords: [
    "AI tool comparison",
    "AI tools",
    "tool comparison table",
    "solopreneur AI tools",
    "creator workflow tools",
  ],
};

export default function ComparisonPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            AI Tool Comparison Builder
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Pick tools from the four-site content index and turn the source data into a clean comparison table.
          </p>
        </section>

        <ComparisonBuilder />
      </div>
    </main>
  );
}
