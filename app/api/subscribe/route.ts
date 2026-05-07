import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const BUTTONDOWN_ENDPOINT = "https://api.buttondown.email/v1/subscribers";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCES = new Set(["hero", "footer", "tool", "default"]);

type SubscribeRequestBody = {
  email?: unknown;
  source?: unknown;
};

function normalizeSource(source: unknown) {
  if (typeof source !== "string") {
    return "default";
  }

  const normalized = source.trim();

  return SOURCES.has(normalized) ? normalized : "default";
}

function isAlreadySubscribed(status: number, payload: unknown) {
  if (status !== 400) {
    return false;
  }

  const message = typeof payload === "string" ? payload : JSON.stringify(payload);
  const normalizedMessage = message.toLowerCase();

  return normalizedMessage.includes("already") || normalizedMessage.includes("duplicate");
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    undefined
  );
}

export async function POST(request: NextRequest) {
  let body: SubscribeRequestBody;

  try {
    body = (await request.json()) as SubscribeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Subscription failed, please try again later" },
      { status: 502 },
    );
  }

  const source = normalizeSource(body.source);
  const clientIp = getClientIp(request);

  try {
    const response = await fetch(BUTTONDOWN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        tags: ["tools-app", source],
        ...(clientIp ? { ip_address: clientIp } : {}),
      }),
    });

    if (response.status === 200 || response.status === 201) {
      return NextResponse.json({ ok: true });
    }

    const responseText = await response.text().catch(() => "");
    let payload: unknown = responseText;

    try {
      payload = responseText ? JSON.parse(responseText) : "";
    } catch {
      payload = responseText;
    }

    if (isAlreadySubscribed(response.status, payload)) {
      return NextResponse.json({ ok: true, already: true });
    }

    return NextResponse.json(
      { error: "Subscription failed, please try again later" },
      {
        status: 502,
        headers: {
          "x-buttondown-status": String(response.status),
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Subscription failed, please try again later" },
      { status: 502 },
    );
  }
}
