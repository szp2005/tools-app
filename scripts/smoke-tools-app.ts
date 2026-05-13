import http from "node:http";
import https from "node:https";
import { getBlogArticles } from "../lib/blog";
import { obsidianScenarios } from "../lib/obsidianTemplates";
import { comparisonPages } from "../lib/comparisonPages";
import { priceTrackerSegments } from "../lib/priceTrackerSegments";

type SmokeResponse = {
  status: number;
  body: string;
  contentType: string;
  headers: Record<string, string | string[] | undefined>;
};

type SmokeCheck = {
  name: string;
  run: () => Promise<string>;
};

const baseUrl = (process.env.SMOKE_BASE_URL ?? "https://tools.toolrouteai.com").replace(/\/$/, "");
const resolveIp = process.env.SMOKE_RESOLVE_IP?.trim();
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? "15000");
const canonicalBaseUrl = "https://tools.toolrouteai.com";
const userAgent =
  process.env.SMOKE_USER_AGENT ??
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const blogArticles = getBlogArticles();
const expectedSitemapUrls = [
  canonicalBaseUrl,
  `${canonicalBaseUrl}/prompt-optimizer`,
  `${canonicalBaseUrl}/comparison`,
  ...comparisonPages.map((page) => `${canonicalBaseUrl}/comparison/${page.slug}`),
  `${canonicalBaseUrl}/obsidian-templates`,
  ...obsidianScenarios.map((scenario) => `${canonicalBaseUrl}/obsidian-templates/${scenario.id}`),
  `${canonicalBaseUrl}/price-tracker`,
  `${canonicalBaseUrl}/side-hustle-ideas`,
  `${canonicalBaseUrl}/zh-cn`,
  `${canonicalBaseUrl}/blog`,
  ...blogArticles.map((article) => article.url),
  ...priceTrackerSegments.map((segment) => `${canonicalBaseUrl}/price-tracker/${segment.slug}`),
];

const checks: SmokeCheck[] = [
  {
    name: "home page",
    run: async () => {
      const response = await request("GET", "/");
      assertStatus(response, 200);
      assertSecurityHeaders(response);
      assertContains(response.body, ["Prompt Optimizer", "Comparison Builder", "Obsidian Template Generator", "Price Tracker", "Side Hustle Ideas"]);
      return "HTTP 200 + five tools visible + security headers";
    },
  },
  {
    name: "health endpoint",
    run: async () => {
      const response = await request("GET", "/health.json");
      assertStatus(response, 200);
      assertContentType(response, "application/json");
      const data = parseJson(response.body);
      if (
        data.status !== "ok" ||
        data.tools?.length !== 5 ||
        !data.locales?.includes("zh-CN") ||
        data.indexes?.price_tracker?.total < 200
      ) {
        throw new Error("unexpected health payload");
      }
      return `HTTP 200 + ${data.tools.length} tools + ${data.locales.length} locales + ${data.indexes.price_tracker.total} price signals`;
    },
  },
  {
    name: "prompt optimizer page",
    run: async () => {
      const response = await request("GET", "/prompt-optimizer");
      assertStatus(response, 200);
      assertContains(response.body, ["Prompt Optimizer"]);
      return "HTTP 200";
    },
  },
  {
    name: "comparison page",
    run: async () => {
      const response = await request("GET", "/comparison");
      assertStatus(response, 200);
      assertContains(response.body, ["Comparison Builder", "Build comparison"]);
      return "HTTP 200";
    },
  },
  {
    name: "comparison segment pages",
    run: async () => {
      const midjourney = await request("GET", "/comparison/midjourney-vs-dall-e-3");
      const notion = await request("GET", "/comparison/notion-vs-obsidian");
      assertStatus(midjourney, 200);
      assertStatus(notion, 200);
      assertContains(midjourney.body, ["Midjourney vs DALL-E 3 Comparison", "Open Comparison Builder"]);
      assertContains(notion.body, ["Notion vs Obsidian Comparison", "Open Comparison Builder"]);
      return "midjourney + notion pages healthy";
    },
  },
  {
    name: "obsidian template page",
    run: async () => {
      const response = await request("GET", "/obsidian-templates");
      assertStatus(response, 200);
      assertContains(response.body, ["Obsidian Template Generator", "Download .zip"]);
      return "HTTP 200";
    },
  },
  {
    name: "price tracker page",
    run: async () => {
      const response = await request("GET", "/price-tracker");
      assertStatus(response, 200);
      assertContains(response.body, ["AI Tool Price Tracker", "Download CSV", "Recent 30-day increases", "Change log JSON"]);
      return "HTTP 200 + exports and change lists visible";
    },
  },
  {
    name: "price tracker segment pages",
    run: async () => {
      const free = await request("GET", "/price-tracker/free-ai-tools");
      const subscription = await request("GET", "/price-tracker/subscription-ai-tools");
      assertStatus(free, 200);
      assertStatus(subscription, 200);
      assertContains(free.body, ["Free AI Tools Price Signals", "Download CSV"]);
      assertContains(subscription.body, ["Subscription AI Tools Price Signals", "Download CSV"]);
      return "free + subscription segment pages healthy";
    },
  },
  {
    name: "price tracker RSS",
    run: async () => {
      const response = await request("GET", "/price-tracker/feed.xml");
      assertStatus(response, 200);
      assertContentType(response, "application/rss+xml");
      assertContains(response.body, ["<rss version=\"2.0\">", "AI Tool Price Tracker", "Price signal:"]);
      return "HTTP 200 + RSS body";
    },
  },
  {
    name: "price tracker JSON",
    run: async () => {
      const response = await request("GET", "/price-tracker/index.json");
      assertStatus(response, 200);
      assertContentType(response, "application/json");
      const data = parseJson(response.body);
      if (data.schema_version !== "1" || data.count < 200 || data.records?.length !== data.count) {
        throw new Error(`unexpected price index payload: count=${data.count}, records=${data.records?.length}`);
      }
      return `HTTP 200 + ${data.count} records`;
    },
  },
  {
    name: "price tracker changes JSON",
    run: async () => {
      const response = await request("GET", "/price-tracker/changes.json");
      assertStatus(response, 200);
      assertContentType(response, "application/json");
      const data = parseJson(response.body);
      if (data.schema_version !== "1" || data.source_count < 50 || data.stats?.recent < 1) {
        throw new Error("unexpected price changes payload");
      }
      return `HTTP 200 + ${data.stats.recent} recent changes`;
    },
  },
  {
    name: "side hustle ideas page",
    run: async () => {
      const response = await request("GET", "/side-hustle-ideas");
      assertStatus(response, 200);
      assertContains(response.body, ["Side Hustle Ideas Generator", "Generate Ideas", "Starting budget"]);
      return "HTTP 200";
    },
  },
  {
    name: "zh-cn landing page",
    run: async () => {
      const response = await request("GET", "/zh-cn");
      assertStatus(response, 200);
      assertContains(response.body, ["Tools App 中文入口", "免费 AI 工具箱", "已上线工具"]);
      return "HTTP 200 + Chinese landing copy";
    },
  },
  {
    name: "blog index and articles",
    run: async () => {
      const index = await request("GET", "/blog");
      assertStatus(index, 200);
      assertContains(index.body, ["Tools App Blog", "How to Use a Prompt Optimizer Effectively"]);

      const firstArticle = await request("GET", `/blog/${blogArticles[0].slug}`);
      assertStatus(firstArticle, 200);
      assertContains(firstArticle.body, ["SoftwareApplication", "Article", "Try the tool"]);
      return `HTTP 200 + ${blogArticles.length} article URLs indexed`;
    },
  },
  {
    name: "sitemap and robots",
    run: async () => {
      const sitemap = await request("GET", "/sitemap.xml");
      const robots = await request("GET", "/robots.txt");
      assertStatus(sitemap, 200);
      assertStatus(robots, 200);
      assertContains(sitemap.body, expectedSitemapUrls);
      assertContains(robots.body, ["Disallow: /api/", "sitemap.xml"]);
      return `sitemap has ${expectedSitemapUrls.length} expected URLs + robots healthy`;
    },
  },
  {
    name: "comparison APIs",
    run: async () => {
      const search = await request("GET", "/api/comparison/search?q=midjourney");
      assertStatus(search, 200);
      const searchData = parseJson(search.body);
      if (!Array.isArray(searchData)) {
        throw new Error("expected comparison search to return an array");
      }
      const ids = searchData.map((item: { id?: string }) => item.id).filter(Boolean).slice(0, 2);
      if (ids.length < 2) {
        throw new Error(`expected at least 2 midjourney results, got ${ids.length}`);
      }

      const build = await request("POST", "/api/comparison/build", { ids });
      assertStatus(build, 200);
      const buildData = parseJson(build.body);
      if (buildData.tools?.length !== 2 || buildData.matrix?.length < 5) {
        throw new Error(`unexpected matrix shape: tools=${buildData.tools?.length}, rows=${buildData.matrix?.length}`);
      }
      return `search ${searchData.length} results + matrix ${buildData.matrix.length} rows`;
    },
  },
  {
    name: "guardrail APIs",
    run: async () => {
      const optimize = await request("POST", "/api/optimize", { prompt: "Improve this prompt" });
      const subscribe = await request("POST", "/api/subscribe", { email: "abc@xyz", source: "smoke" });
      assertStatus(optimize, 403);
      assertStatus(subscribe, 400);
      return "optimize without Turnstile 403 + invalid subscribe 400";
    },
  },
];

async function main() {
  const startedAt = Date.now();
  const results: Array<{ name: string; ok: boolean; detail: string }> = [];

  for (const check of checks) {
    try {
      const detail = await check.run();
      results.push({ name: check.name, ok: true, detail });
      console.log(`PASS | ${check.name} | ${detail}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      results.push({ name: check.name, ok: false, detail });
      console.log(`FAIL | ${check.name} | ${detail}`);
    }
  }

  const passed = results.filter((result) => result.ok).length;
  const failed = results.length - passed;
  console.log(`\nSummary: ${passed}/${results.length} passed in ${Date.now() - startedAt}ms`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

function request(method: "GET" | "POST", pathname: string, jsonBody?: unknown): Promise<SmokeResponse> {
  const url = new URL(pathname, baseUrl);
  const body = jsonBody ? JSON.stringify(jsonBody) : undefined;
  const transport = url.protocol === "http:" ? http : https;
  const headers: Record<string, string> = {
    "user-agent": userAgent,
    accept: "application/json,text/html,application/xml,text/xml,*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    pragma: "no-cache",
  };

  if (body) {
    headers["content-type"] = "application/json";
    headers["content-length"] = String(Buffer.byteLength(body));
  }
  if (resolveIp) {
    headers.host = url.host;
  }

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        protocol: url.protocol,
        hostname: resolveIp || url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method,
        headers,
        servername: url.hostname,
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8"),
            contentType: String(res.headers["content-type"] ?? ""),
            headers: res.headers,
          });
        });
      },
    );

    req.on("timeout", () => {
      req.destroy(new Error(`request timed out after ${timeoutMs}ms: ${method} ${url.href}`));
    });
    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function assertStatus(response: SmokeResponse, expectedStatus: number) {
  if (response.status !== expectedStatus) {
    throw new Error(`expected HTTP ${expectedStatus}, got ${response.status}`);
  }
}

function assertContentType(response: SmokeResponse, expectedPart: string) {
  if (!response.contentType.includes(expectedPart)) {
    throw new Error(`expected content-type containing ${expectedPart}, got ${response.contentType}`);
  }
}

function assertContains(body: string, snippets: string[]) {
  const missing = snippets.filter((snippet) => !body.includes(snippet));
  if (missing.length > 0) {
    throw new Error(`missing snippets: ${missing.join(", ")}`);
  }
}

function assertSecurityHeaders(response: SmokeResponse) {
  assertHeader(response, "x-content-type-options", "nosniff");
  assertHeader(response, "x-frame-options", "DENY");
  assertHeader(response, "referrer-policy", "strict-origin-when-cross-origin");
  assertHeader(response, "permissions-policy", "camera=()");
}

function assertHeader(response: SmokeResponse, name: string, expectedPart: string) {
  const rawValue = response.headers[name.toLowerCase()];
  const value = Array.isArray(rawValue) ? rawValue.join(", ") : String(rawValue ?? "");

  if (!value.includes(expectedPart)) {
    throw new Error(`expected ${name} containing ${expectedPart}, got ${value || "(missing)"}`);
  }
}

function parseJson(body: string) {
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error(`invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
