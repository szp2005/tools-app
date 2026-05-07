import { NextRequest, NextResponse } from "next/server";
import { optimizePrompt } from "@/lib/anthropic";
import { checkRateLimit, incrementRateLimit } from "@/lib/rateLimit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "edge";

type OptimizeRequestBody = {
  prompt?: unknown;
  turnstileToken?: unknown;
};

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

export async function POST(request: NextRequest) {
  let body: OptimizeRequestBody;

  try {
    body = (await request.json()) as OptimizeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";

  if (prompt.length < 3) {
    return NextResponse.json({ error: "Prompt must be at least 3 characters." }, { status: 400 });
  }

  if (prompt.length > 4000) {
    return NextResponse.json({ error: "Prompt must be 4000 characters or fewer." }, { status: 400 });
  }

  try {
    const clientIp = getClientIp(request);
    const turnstile = await verifyTurnstileToken(turnstileToken, clientIp);

    if (!turnstile.success) {
      return NextResponse.json({ error: "Captcha verification failed." }, { status: 403 });
    }

    const rateLimit = await checkRateLimit(clientIp);

    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "今日额度已用完，订阅 Newsletter 可解锁更多额度" },
        { status: 429 },
      );
    }

    const result = await optimizePrompt(prompt);
    await incrementRateLimit(clientIp);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error:
          message === "Missing Anthropic API key."
            ? "Prompt optimizer is not configured yet."
            : "The optimizer is temporarily unavailable. Please try again shortly.",
      },
      { status: message === "Missing Anthropic API key." ? 500 : 502 },
    );
  }
}
