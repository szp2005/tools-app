import { PromptOptimizerForm } from "@/components/PromptOptimizerForm";

export const metadata = {
  title: "Prompt Optimizer | Tools App",
  description: "Rewrite rough AI prompts into clear, structured prompts for ChatGPT, Claude, and Gemini.",
};

export default function PromptOptimizerPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
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
