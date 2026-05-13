import type { Metadata } from "next";
import { PromptOptimizerForm } from "@/components/PromptOptimizerForm";
import { buildSoftwareApplicationJsonLd } from "@/lib/seo";

const pageTitle = "AI Prompt Optimizer | Tools App";
const pageDescription =
  "Rewrite rough AI instructions into clear, structured prompts for ChatGPT, Claude, Gemini, and other LLM workflows.";
const pageUrl = "https://tools.toolrouteai.com/prompt-optimizer";
const ogImage = "/og-prompt-optimizer.png";

export const metadata: Metadata = {
  title: "Prompt Optimizer | Tools App",
  description: pageDescription,
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

export default function PromptOptimizerPage() {
  const structuredData = buildSoftwareApplicationJsonLd({
    name: "AI Prompt Optimizer",
    url: pageUrl,
    description: pageDescription,
    applicationCategory: "ProductivityApplication",
    featureList: [
      "Prompt rewriting",
      "Output constraints",
      "LLM workflow structure",
      "Turnstile protected free usage",
    ],
    keywords: ["AI prompt optimizer", "prompt generator", "ChatGPT prompts", "Claude prompts"],
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
            Prompt Optimizer
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Turn a rough instruction into a clear, structured prompt with output expectations, constraints, and a short explanation of what improved.
          </p>
        </section>

        <PromptOptimizerForm />
      </div>
    </main>
  );
}
