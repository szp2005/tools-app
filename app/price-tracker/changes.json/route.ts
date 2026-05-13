import { buildPriceChangePayload } from "@/lib/priceChanges";

export const runtime = "edge";

export function GET() {
  return Response.json(buildPriceChangePayload(), {
    headers: {
      "cache-control": "public, max-age=3600",
    },
  });
}
