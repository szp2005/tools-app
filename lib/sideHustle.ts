export type SideHustleSkill = "writing" | "design" | "programming" | "marketing" | "operations";
export type SideHustleTime = "5h" | "10h" | "20h";
export type SideHustleBudget = "0" | "500" | "5000";

export type SideHustleInput = {
  skill: SideHustleSkill;
  time: SideHustleTime;
  budget: SideHustleBudget;
};

export type SideHustleTool = {
  name: string;
  purpose: string;
  amazon_url: string;
};

export type SideHustleIdea = {
  title: string;
  fit: string;
  income_range: string;
  startup_path: string[];
  tools: SideHustleTool[];
  risks: string[];
};

export type SideHustleIdeasResult = {
  ideas: SideHustleIdea[];
};

type AnthropicMessageResponse = {
  content?: Array<
    | {
        type: "text";
        text: string;
      }
    | {
        type: string;
        [key: string]: unknown;
      }
  >;
  error?: {
    message?: string;
  };
};

type RawIdeasJson = {
  ideas?: unknown;
};

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_AFFILIATE_TAG = "toolrouteai-20";

const skillLabels: Record<SideHustleSkill, string> = {
  writing: "writing",
  design: "design",
  programming: "programming",
  marketing: "marketing",
  operations: "operations",
};

const timeLabels: Record<SideHustleTime, string> = {
  "5h": "5 hours/week",
  "10h": "10 hours/week",
  "20h": "20 hours/week",
};

const budgetLabels: Record<SideHustleBudget, string> = {
  "0": "$0",
  "500": "$500",
  "5000": "$5,000",
};

const fallbackTools: Record<SideHustleSkill, Array<Omit<SideHustleTool, "amazon_url">>> = {
  writing: [
    { name: "USB microphone", purpose: "Record client walkthroughs, audits, or voice notes." },
    { name: "Kindle Scribe", purpose: "Read, annotate, and extract source material for content work." },
  ],
  design: [
    { name: "Drawing tablet", purpose: "Create thumbnails, visual drafts, and client markups faster." },
    { name: "Color calibration card", purpose: "Keep product and content visuals consistent." },
  ],
  programming: [
    { name: "Ergonomic keyboard", purpose: "Reduce strain during focused coding sessions." },
    { name: "USB-C portable monitor", purpose: "Keep docs, editor, and test output visible while building." },
  ],
  marketing: [
    { name: "Ring light", purpose: "Create clean short-form video assets for testing offers." },
    { name: "Wireless lavalier microphone", purpose: "Record clearer hooks, interviews, and client explainers." },
  ],
  operations: [
    { name: "Label maker", purpose: "Build repeatable physical workflows for small teams." },
    { name: "Document scanner", purpose: "Digitize forms, receipts, and back-office paperwork." },
  ],
};

export const SIDE_HUSTLE_SYSTEM_PROMPT = [
  "You generate practical side-hustle ideas for one-person creators.",
  "Return strict JSON only. No markdown.",
  "Avoid hype, passive income claims, and vague advice.",
  "Each idea must be feasible for a beginner to test within 14 days.",
  "Each idea must include concrete startup steps, realistic income ranges, and risk notes.",
].join(" ");

export function buildSideHustleUserPrompt(input: SideHustleInput, affiliateTag = DEFAULT_AFFILIATE_TAG) {
  return [
    "Generate exactly 3 side-hustle ideas.",
    `Skill: ${skillLabels[input.skill]}`,
    `Time available: ${timeLabels[input.time]}`,
    `Starting budget: ${budgetLabels[input.budget]}`,
    "",
    "JSON shape:",
    "{",
    '  "ideas": [',
    "    {",
    '      "title": "specific side hustle name",',
    '      "fit": "why this matches the user",',
    '      "income_range": "$X-$Y/month after 60-90 days",',
    '      "startup_path": ["step 1", "step 2", "step 3", "step 4"],',
    '      "tools": [{"name": "tool", "purpose": "why it helps", "amazon_url": "https://www.amazon.com/s?k=tool&tag=' + affiliateTag + '"}],',
    '      "risks": ["risk 1", "risk 2"]',
    "    }",
    "  ]",
    "}",
    "",
    "Include at least two Amazon affiliate links across the full response.",
  ].join("\n");
}

export function validateSideHustleInput(input: {
  skill?: unknown;
  time?: unknown;
  budget?: unknown;
}): SideHustleInput {
  if (!isSideHustleSkill(input.skill)) {
    throw new Error("Choose a valid skill.");
  }

  if (!isSideHustleTime(input.time)) {
    throw new Error("Choose a valid weekly time budget.");
  }

  if (!isSideHustleBudget(input.budget)) {
    throw new Error("Choose a valid starting budget.");
  }

  return {
    skill: input.skill,
    time: input.time,
    budget: input.budget,
  };
}

export async function generateSideHustleIdeas(
  input: SideHustleInput,
  affiliateTag = process.env.AMAZON_AFFILIATE_TAG_TOOLS ??
    process.env.PUBLIC_AMAZON_AFFILIATE_TAG_AI_TOOLS_PRO ??
    DEFAULT_AFFILIATE_TAG,
): Promise<SideHustleIdeasResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY_TOOLS;

  if (!apiKey) {
    throw new Error("Missing Anthropic API key.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 1800,
        temperature: 0.4,
        system: SIDE_HUSTLE_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildSideHustleUserPrompt(input, affiliateTag),
          },
        ],
      }),
    });

    const message = (await response.json()) as AnthropicMessageResponse;

    if (!response.ok) {
      throw new Error(message.error?.message || "Anthropic request failed.");
    }

    return parseSideHustleIdeasJson(extractText(message.content), input.skill, affiliateTag);
  } finally {
    clearTimeout(timeout);
  }
}

export function parseSideHustleIdeasJson(
  raw: string,
  skill: SideHustleSkill,
  affiliateTag = DEFAULT_AFFILIATE_TAG,
): SideHustleIdeasResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch?.[0] ?? raw) as RawIdeasJson;
  const rawIdeas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
  const ideas = rawIdeas
    .map((item) => normalizeIdea(item, skill, affiliateTag))
    .filter((item): item is SideHustleIdea => item !== null)
    .slice(0, 3);

  if (ideas.length !== 3) {
    throw new Error("Anthropic response did not include exactly 3 ideas.");
  }

  ensureAffiliateCoverage(ideas, skill, affiliateTag);

  return { ideas };
}

export function buildAmazonSearchUrl(query: string, affiliateTag = DEFAULT_AFFILIATE_TAG) {
  const cleanTag = affiliateTag.trim() || DEFAULT_AFFILIATE_TAG;

  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${encodeURIComponent(cleanTag)}`;
}

function normalizeIdea(
  item: unknown,
  skill: SideHustleSkill,
  affiliateTag: string,
): SideHustleIdea | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const value = item as Record<string, unknown>;
  const title = valueToString(value.title);
  const fit = valueToString(value.fit);
  const incomeRange = valueToString(value.income_range);
  const startupPath = valueToStringArray(value.startup_path).slice(0, 5);
  const risks = valueToStringArray(value.risks).slice(0, 4);
  const tools = normalizeTools(value.tools, affiliateTag);

  if (!title || !fit || !incomeRange || startupPath.length < 3 || risks.length < 1) {
    return null;
  }

  return {
    title,
    fit,
    income_range: incomeRange,
    startup_path: startupPath,
    tools: tools.length > 0 ? tools : fallbackToolsFor(skill, affiliateTag).slice(0, 1),
    risks,
  };
}

function normalizeTools(value: unknown, affiliateTag: string): SideHustleTool[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const name = valueToString(record.name);
      const purpose = valueToString(record.purpose);

      if (!name || !purpose) {
        return null;
      }

      return {
        name,
        purpose,
        amazon_url: normalizeAmazonUrl(valueToString(record.amazon_url), name, affiliateTag),
      };
    })
    .filter((item): item is SideHustleTool => item !== null)
    .slice(0, 3);
}

function ensureAffiliateCoverage(
  ideas: SideHustleIdea[],
  skill: SideHustleSkill,
  affiliateTag: string,
) {
  const amazonCount = ideas.flatMap((idea) => idea.tools).filter((tool) => tool.amazon_url.includes("amazon.com")).length;
  if (amazonCount >= 2) {
    return;
  }

  const fallback = fallbackToolsFor(skill, affiliateTag);
  let fallbackIndex = 0;

  for (const idea of ideas) {
    while (idea.tools.length < 2 && fallbackIndex < fallback.length) {
      idea.tools.push(fallback[fallbackIndex]);
      fallbackIndex += 1;
    }
  }
}

function fallbackToolsFor(skill: SideHustleSkill, affiliateTag: string): SideHustleTool[] {
  return fallbackTools[skill].map((tool) => ({
    ...tool,
    amazon_url: buildAmazonSearchUrl(tool.name, affiliateTag),
  }));
}

function normalizeAmazonUrl(value: string, toolName: string, affiliateTag: string) {
  if (value.includes("amazon.com") && value.includes("tag=")) {
    return value;
  }

  return buildAmazonSearchUrl(toolName, affiliateTag);
}

function extractText(content: AnthropicMessageResponse["content"]) {
  return (content ?? [])
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

function valueToString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function valueToStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    : [];
}

function isSideHustleSkill(value: unknown): value is SideHustleSkill {
  return value === "writing" || value === "design" || value === "programming" || value === "marketing" || value === "operations";
}

function isSideHustleTime(value: unknown): value is SideHustleTime {
  return value === "5h" || value === "10h" || value === "20h";
}

function isSideHustleBudget(value: unknown): value is SideHustleBudget {
  return value === "0" || value === "500" || value === "5000";
}
