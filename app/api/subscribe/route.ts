import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const BUTTONDOWN_ENDPOINT = "https://api.buttondown.email/v1/subscribers";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCES = new Set(["hero", "footer", "tool", "default"]);

type SubscribeRequestBody = {
  email?: unknown;
  source?: unknown;
};

type ButtondownPayload = {
  email_address: string;
  tags: string[];
  ip_address?: string;
};

type ButtondownResult = {
  status: number;
  ok: boolean;
  payload: unknown;
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

  if (normalizedMessage.includes("does not exist") || normalizedMessage.includes("not found")) {
    return false;
  }

  return (
    normalizedMessage.includes("already") ||
    normalizedMessage.includes("duplicate") ||
    normalizedMessage.includes("exist")
  );
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    undefined
  );
}

async function createButtondownSubscriber(
  apiKey: string,
  payload: ButtondownPayload,
  collisionBehavior?: "add",
): Promise<ButtondownResult> {
  const response = await fetch(BUTTONDOWN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
      ...(collisionBehavior ? { "X-Buttondown-Collision-Behavior": collisionBehavior } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 200 || response.status === 201) {
    return { status: response.status, ok: true, payload: null };
  }

  const responseText = await response.text().catch(() => "");
  let payloadBody: unknown = responseText;

  try {
    payloadBody = responseText ? JSON.parse(responseText) : "";
  } catch {
    payloadBody = responseText;
  }

  return { status: response.status, ok: false, payload: payloadBody };
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
  const payload = {
    email_address: email,
    tags: ["tools-app", source],
    ...(clientIp ? { ip_address: clientIp } : {}),
  };

  try {
    const result = await createButtondownSubscriber(apiKey, payload);

    if (result.ok) {
      return NextResponse.json({ ok: true });
    }

    if (result.status === 400) {
      const upsert = await createButtondownSubscriber(apiKey, payload, "add");

      if (upsert.ok || isAlreadySubscribed(result.status, result.payload)) {
        return NextResponse.json({ ok: true, already: true });
      }
    }

    return NextResponse.json(
      { error: "Subscription failed, please try again later" },
      {
        status: 502,
        headers: {
          "x-buttondown-status": String(result.status),
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
