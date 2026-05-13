import type { Metadata } from "next";
import Link from "next/link";
import { getBlogArticles } from "@/lib/blog";

const pageTitle = "Tools App Blog";
const pageDescription = "Deep guides for using free AI tools in practical solo-business workflows.";
const pageUrl = "https://tools.toolrouteai.com/blog";

export const metadata: Metadata = {
  title: `${pageTitle} | Tools App`,
  description: pageDescription,
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
};

export default function BlogIndexPage() {
  const articles = getBlogArticles();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 lg:px-10">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Tools App Blog
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
            Practical guides for choosing tools, improving prompts, building note systems, watching software costs, and testing side-hustle ideas.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <span className="text-sm font-semibold text-violet-700">{article.toolName}</span>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">{article.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{article.description}</p>
              <p className="mt-5 text-sm font-medium text-slate-500">{article.wordCount.toLocaleString()} words</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
