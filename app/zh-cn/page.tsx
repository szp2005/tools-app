import type { Metadata } from "next";
import Link from "next/link";
import { SubscribeWidget } from "@/components/SubscribeWidget";
import { siteBaseUrl, zhCnObsidianLinks, zhCnSubscribeCopy, zhCnToolCards } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Tools App — 免费 AI 工具箱",
  description: "给一人公司、创作者和独立开发者使用的免费 AI 工具：提示词优化、工具对比、Obsidian 模板、价格追踪和副业灵感。",
  alternates: {
    canonical: "/zh-cn",
    languages: {
      en: siteBaseUrl,
      "zh-CN": `${siteBaseUrl}/zh-cn`,
    },
  },
  openGraph: {
    title: "Tools App — 免费 AI 工具箱",
    description: "免费 AI 工具 + 每周简报，帮一人公司更快完成提示词、工具对比、模板和副业验证。",
    url: `${siteBaseUrl}/zh-cn`,
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function ZhCnHome() {
  return (
    <main lang="zh-CN" className="min-h-screen bg-white text-slate-950">
      <section className="mx-auto flex min-h-[78vh] w-full max-w-6xl flex-col justify-center px-5 pb-12 pt-16 sm:px-8 lg:pb-16">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">Tools App 中文入口</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">
            给一人公司和创作者用的免费 AI 工具箱
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            不用注册就能用：提示词优化、AI 工具对比、Obsidian 模板、价格追踪和副业灵感生成器。工具先解决真实工作流，再慢慢做成公开资源。
          </p>
          <SubscribeWidget variant="hero" source="hero" copy={zhCnSubscribeCopy} />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">已上线工具</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                中文入口先聚合导航，工具页面保持英文版稳定运行，后续按转化数据逐页本地化。
              </p>
            </div>
            <Link href="/" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">
              English version
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {zhCnToolCards.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-950">{tool.name}</h3>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      tool.status === "MVP"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {tool.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{tool.description}</p>
                <p className="mt-8 text-sm font-semibold text-slate-950">打开工具</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Obsidian 模板包</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  直接进入具体场景，下载 Markdown / Dataview / Templater 友好的模板包。
                </p>
              </div>
              <Link
                href="/obsidian-templates"
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                打开生成器
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {zhCnObsidianLinks.map((scenario) => (
                <Link
                  key={scenario.href}
                  href={scenario.href}
                  className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="block text-sm font-semibold text-slate-950">{scenario.name}</span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{scenario.description}</span>
                  <span className="mt-4 block text-sm font-semibold text-slate-950">打开模板包</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="text-2xl font-semibold text-slate-950">为什么做这个</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            这是一个边做业务边沉淀出来的工具站：英文内容站负责带来搜索流量，免费工具负责提供价值，Newsletter 负责留住用户。中文入口先把项目讲清楚，后续再根据真实点击和订阅数据翻译优先级最高的工具页。
          </p>
        </div>
      </section>
    </main>
  );
}
