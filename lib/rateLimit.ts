import { getOptionalRequestContext } from "@cloudflare/next-on-pages";

const DAILY_LIMIT = 20;
const RATE_LIMIT_TTL_SECONDS = 60 * 60 * 24;

type RateLimitResult = {
  limited: boolean;
  remaining: number | null;
};

type RateLimitKv = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type RateLimitEnv = CloudflareEnv & {
  RATE_LIMIT?: RateLimitKv;
};

function getDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getRateLimitKv() {
  try {
    return (getOptionalRequestContext()?.env as RateLimitEnv | undefined)?.RATE_LIMIT;
  } catch {
    return undefined;
  }
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const kv = getRateLimitKv();

  if (!kv) {
    return { limited: false, remaining: null };
  }

  try {
    const key = `optimize:${ip}:${getDateKey()}`;
    const current = Number((await kv.get(key)) || "0");

    return {
      limited: current >= DAILY_LIMIT,
      remaining: Math.max(DAILY_LIMIT - current, 0),
    };
  } catch {
    return { limited: false, remaining: null };
  }
}

export async function incrementRateLimit(ip: string) {
  const kv = getRateLimitKv();

  if (!kv) {
    return;
  }

  try {
    const key = `optimize:${ip}:${getDateKey()}`;
    const current = Number((await kv.get(key)) || "0");
    await kv.put(key, String(current + 1), {
      expirationTtl: RATE_LIMIT_TTL_SECONDS,
    });
  } catch {
    // Fail open: KV availability should never block the optimizer.
  }
}
