import { NextRequest, NextResponse } from "next/server";
import { optimizePrompt } from "@/lib/anthropic";
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
    null
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
    const turnstile = await verifyTurnstileToken(turnstileToken, getClientIp(request));

    if (!turnstile.success && !turnstile.skipped) {
      return NextResponse.json({ error: "Captcha verification failed." }, { status: 403 });
    }

    const result = await optimizePrompt(prompt);
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
