import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { incrementArticleViews } from "@/lib/trending";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID artikel tidak valid" }, { status: 400 });
    }

    const updated = await incrementArticleViews(id);

    if (!updated) {
      return NextResponse.json({ error: "Artikel tidak ditemukan atau belum dipublikasikan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      views: updated.views,
      weeklyViews: updated.weeklyViews
    });
  } catch (error) {
    console.error("Gagal menambahkan view artikel:", error);
    return NextResponse.json({ error: "Gagal memproses view artikel" }, { status: 500 });
  }
}
