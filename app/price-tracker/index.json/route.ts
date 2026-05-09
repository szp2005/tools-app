import { buildPriceTrackerIndexPayload } from "@/lib/priceTracker";

export const runtime = "edge";

export function GET() {
  return Response.json(buildPriceTrackerIndexPayload(), {
    headers: {
      "cache-control": "public, max-age=3600",
    },
  });
}
