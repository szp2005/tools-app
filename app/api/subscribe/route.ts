import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const BUTTONDOWN_ENDPOINT = "https://api.buttondown.com/v1/subscribers";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCES = new Set(["hero", "footer", "tool", "default"]);

type SubscribeRequestBody = {
  email?: unknown;
  source?: unknown;
};

type ButtondownPayload = {
  email_address: string;
  tags: string[];
  type: "regular";
  ip_address?: string;
};

type ButtondownResult = {
  status: number;
  ok: boolean;
  payload: unknown;
};

type ButtondownRequestOptions = {
  bypassFirewall?: boolean;
  collisionBehavior?: "add";
};

function normalizeSource(source: unknown) {
  if (typeof source !== "string") {
    return "default";
  }

  const normalized = source.trim();

  return SOURCES.has(normalized) ? normalized : "default";
}

function isAlreadySubscribed(status: number, payload: unknown) {
  if (status === 409) {
    return true;
  }

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

function getButtondownMessage(payload: unknown) {
  const raw = typeof payload === "string" ? payload : JSON.stringify(payload);

  return raw.toLowerCase();
}

function isFirewallBlocked(status: number, payload: unknown) {
  if (status !== 400) {
    return false;
  }

  const message = getButtondownMessage(payload);

  return message.includes("subscriber_blocked") || message.includes("firewall");
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
  options: ButtondownRequestOptions = {},
): Promise<ButtondownResult> {
  const response = await fetch(BUTTONDOWN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: apiKey.toLowerCase().startsWith("token ") ? apiKey : `Token ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.bypassFirewall ? { "X-Buttondown-Bypass-Firewall": "true" } : {}),
      ...(options.collisionBehavior
        ? { "X-Buttondown-Collision-Behavior": options.collisionBehavior }
        : {}),
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

  const apiKey = process.env.BUTTONDOWN_API_KEY?.trim();

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
    type: "regular" as const,
    ...(clientIp ? { ip_address: clientIp } : {}),
  };

  try {
    const result = await createButtondownSubscriber(apiKey, payload);

    if (result.ok) {
      return NextResponse.json({ ok: true });
    }

    if (isFirewallBlocked(result.status, result.payload)) {
      const bypass = await createButtondownSubscriber(apiKey, payload, {
        bypassFirewall: true,
        collisionBehavior: "add",
      });

      if (bypass.ok) {
        return NextResponse.json({ ok: true });
      }

      if (isAlreadySubscribed(bypass.status, bypass.payload)) {
        return NextResponse.json({ ok: true, already: true });
      }
    }

    if (result.status === 400 || result.status === 409) {
      const upsert = await createButtondownSubscriber(apiKey, payload, {
        collisionBehavior: "add",
      });

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
