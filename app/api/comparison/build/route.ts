import { NextResponse } from "next/server";
import { buildComparison, validateComparisonIds } from "@/lib/comparison";

export const runtime = "edge";

type BuildRequestBody = {
  ids?: unknown;
};

export async function POST(request: Request) {
  let body: BuildRequestBody;

  try {
    body = (await request.json()) as BuildRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let ids: string[];

  try {
    ids = validateComparisonIds(body.ids);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid ids." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(buildComparison(ids));
  } catch {
    return NextResponse.json({ error: "One or more ids were not found." }, { status: 404 });
  }
}
