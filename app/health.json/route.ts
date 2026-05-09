import { buildSiteHealthPayload } from "@/lib/siteHealth";

export const runtime = "edge";

export function GET() {
  return Response.json(buildSiteHealthPayload(), {
    headers: {
      "cache-control": "public, max-age=300",
    },
  });
}
