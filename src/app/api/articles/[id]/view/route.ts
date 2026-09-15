import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const existingArticle = await db.article.findUnique({
      where: { id },
      select: { id: true, publishedAt: true }
    });

    if (!existingArticle || !existingArticle.publishedAt) {
      return NextResponse.json({ error: "Artikel tidak ditemukan atau belum dipublikasikan" }, { status: 404 });
    }

    const updated = await db.article.update({
      where: { id },
      data: {
        views: { increment: 1 }
      },
      select: {
        id: true,
        views: true
      }
    });

    return NextResponse.json({
      success: true,
      views: updated.views
    });
  } catch (error) {
    console.error("Gagal menambahkan view artikel:", error);
    return NextResponse.json({ error: "Gagal memproses view artikel" }, { status: 500 });
  }
}
