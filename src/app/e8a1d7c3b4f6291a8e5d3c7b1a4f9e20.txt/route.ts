import { NextResponse } from "next/server";
import { INDEXNOW_KEY } from "@/lib/indexing";

export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
