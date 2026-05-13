import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubscribeWidget } from "@/components/SubscribeWidget";
import { getBlogArticle, getBlogSlugs, type BlogBlock } from "@/lib/blog";
import { buildSoftwareApplicationJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getBlogArticle(params.slug);
  if (!article) {
    return {};
  }

  return {
    title: `${article.title} | Tools App`,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: article.url,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: article.url,
      siteName: "Tools App",
      images: [{ url: article.ogImage, width: 1200, height: 630 }],
      type: "article",
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [article.ogImage],
    },
  };
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = getBlogArticle(params.slug);
  if (!article) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.description,
        image: `https://tools.toolrouteai.com${article.ogImage}`,
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        wordCount: article.wordCount,
        mainEntityOfPage: article.url,
        author: {
          "@type": "Organization",
          name: "Tools App",
          url: "https://tools.toolrouteai.com",
        },
        publisher: {
          "@type": "Organization",
          name: "Tools App",
          url: "https://tools.toolrouteai.com",
        },
      },
      buildSoftwareApplicationJsonLd({
        name: article.toolName,
        url: `https://tools.toolrouteai.com${article.toolHref}`,
        description: article.description,
        applicationCategory: article.applicationCategory,
        featureList: article.featureList,
        keywords: article.keywords,
      }),
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="mx-auto grid w-full max-w-4xl gap-8 px-5 py-10 sm:px-8 lg:px-10">
        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Link href="/" className="text-sm font-semibold text-violet-700 transition hover:text-violet-900">
            Tools App
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">{article.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-slate-500">
            <span>{article.publishedAt}</span>
            <span>{article.wordCount.toLocaleString()} words</span>
            <span>{article.toolName}</span>
          </div>
        </header>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6">
            {article.blocks.map((block, index) => (
              <BlogBlockView key={`${block.type}-${index}`} block={block} />
            ))}
          </div>
        </div>

        <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Try the tool</h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              Put the workflow into practice with the free {article.toolName} inside Tools App.
            </p>
          </div>
          <Link
            href={article.toolHref}
            className="inline-flex min-h-11 w-fit items-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open {article.toolName}
          </Link>
          <SubscribeWidget variant="inline" source="tool" />
        </section>
      </article>
    </main>
  );
}

function BlogBlockView({ block }: { block: BlogBlock }) {
  if (block.type === "h2") {
    return <h2 className="pt-2 text-2xl font-semibold text-slate-950">{block.text}</h2>;
  }

  if (block.type === "h3") {
    return <h3 className="text-xl font-semibold text-slate-950">{block.text}</h3>;
  }

  if (block.type === "ul") {
    return (
      <ul className="grid list-disc gap-2 pl-6 text-base leading-8 text-slate-700">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return <p className="text-base leading-8 text-slate-700">{block.text}</p>;
}
