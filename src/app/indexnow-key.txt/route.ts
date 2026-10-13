import { NextResponse } from "next/server";
import { INDEXNOW_KEY } from "@/lib/indexing";

/**
 * IndexNow key verification endpoint.
 * Serves the IndexNow API key as plain text at /indexnow-key.txt
 * Required for domain ownership verification by Bing, Yandex, DuckDuckGo, etc.
 */
export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
