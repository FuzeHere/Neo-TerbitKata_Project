import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Restore an article from trash back to active (Admin intervention)
 */
export async function POST(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses khusus Super Admin" }, { status: 403 });
    }

    const article = await db.article.findUnique({ where: { id } });
    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    // Restore article by clearing deletedAt
    const restored = await db.article.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    return NextResponse.json({
      message: "Artikel berhasil dipulihkan (intervensi berhasil). Artikel kini kembali aktif di portal.",
      article: restored,
    });
  } catch (error) {
    console.error("Error restoring article from trash:", error);
    return NextResponse.json({ error: "Gagal memulihkan artikel" }, { status: 500 });
  }
}

/**
 * Permanently delete an article from trash (Admin approval)
 */
export async function DELETE(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses khusus Super Admin" }, { status: 403 });
    }

    const article = await db.article.findUnique({ where: { id } });
    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    // Permanently remove from database
    await db.article.delete({ where: { id } });

    return NextResponse.json({
      message: "Penghapusan disetujui. Artikel telah dihapus secara permanen.",
    });
  } catch (error) {
    console.error("Error permanently deleting article:", error);
    return NextResponse.json({ error: "Gagal menghapus artikel secara permanen" }, { status: 500 });
  }
}
