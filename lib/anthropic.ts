import { buildOptimizerUserPrompt, PROMPT_OPTIMIZER_SYSTEM_PROMPT } from "./prompts";
import type { OptimizeResult } from "./types";

type AnthropicJson = {
  optimized?: unknown;
  improvements?: unknown;
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

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

function getApiKey() {
  return process.env.ANTHROPIC_API_KEY_TOOLS || process.env.ANTHROPIC_API_KEY;
}

function extractText(content: AnthropicMessageResponse["content"]) {
  return (content ?? [])
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

function parseOptimizerJson(raw: string): OptimizeResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch?.[0] ?? raw) as AnthropicJson;

  if (typeof parsed.optimized !== "string" || !Array.isArray(parsed.improvements)) {
    throw new Error("Anthropic response did not match optimizer schema.");
  }

  const improvements = parsed.improvements
    .filter((item): item is string => typeof item === "string")
    .slice(0, 5);

  if (improvements.length === 0) {
    throw new Error("Anthropic response did not include improvements.");
  }

  return {
    optimized: parsed.optimized,
    improvements,
  };
}

export async function optimizePrompt(prompt: string): Promise<OptimizeResult> {
  const apiKey = getApiKey();

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
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 1200,
        temperature: 0.2,
        system: PROMPT_OPTIMIZER_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildOptimizerUserPrompt(prompt),
          },
        ],
      }),
    });

    const message = (await response.json()) as AnthropicMessageResponse;

    if (!response.ok) {
      throw new Error(message.error?.message || "Anthropic request failed.");
    }

    return parseOptimizerJson(extractText(message.content));
  } finally {
    clearTimeout(timeout);
  }
}
