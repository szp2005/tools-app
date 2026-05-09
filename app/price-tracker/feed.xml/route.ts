import { buildPriceTrackerFeedXml } from "@/lib/priceTracker";

export const runtime = "edge";

export function GET() {
  return new Response(buildPriceTrackerFeedXml(), {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
