import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-16 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">tools.toolrouteai.com</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-normal sm:text-6xl">
            Free AI tools for faster work.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Start with the Prompt Optimizer: turn rough instructions into structured prompts for ChatGPT, Claude, and Gemini.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/prompt-optimizer"
              className="rounded-md bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Prompt Optimizer
            </Link>
            <a
              href="mailto:szpwqq@gmail.com"
              className="rounded-md border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Contact
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
