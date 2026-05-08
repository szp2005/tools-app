import { NextRequest, NextResponse } from "next/server";
import { parseSearchLimit, searchTools } from "@/lib/comparison";

export const runtime = "edge";

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = parseSearchLimit(request.nextUrl.searchParams.get("limit"));

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  return NextResponse.json(searchTools(query, limit));
}
