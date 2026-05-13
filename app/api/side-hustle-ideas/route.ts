import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, incrementRateLimit } from "@/lib/rateLimit";
import { generateSideHustleIdeas, validateSideHustleInput } from "@/lib/sideHustle";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "edge";

type SideHustleRequestBody = {
  skill?: unknown;
  time?: unknown;
  budget?: unknown;
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
  let body: SideHustleRequestBody;

  try {
    body = (await request.json()) as SideHustleRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let input;
  try {
    input = validateSideHustleInput({
      skill: body.skill,
      time: body.time,
      budget: body.budget,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid input." },
      { status: 400 },
    );
  }

  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";
  const clientIp = getClientIp(request);

  try {
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

    const result = await generateSideHustleIdeas(input);
    await incrementRateLimit(clientIp);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error:
          message === "Missing Anthropic API key."
            ? "Side-hustle ideas are not configured yet."
            : "The idea generator is temporarily unavailable. Please try again shortly.",
      },
      { status: message === "Missing Anthropic API key." ? 500 : 502 },
    );
  }
}
