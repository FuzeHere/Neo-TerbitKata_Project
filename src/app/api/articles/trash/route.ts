import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cleanupExpiredTrash, getTrashExpiryDate, getTrashRemainingInfo } from "@/lib/trash";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses khusus Super Admin" }, { status: 403 });
    }

    // Automatically clean up expired items (> 3 days)
    await cleanupExpiredTrash();

    const articles = await db.article.findMany({
      where: {
        deletedAt: { not: null },
      },
      orderBy: { deletedAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        categories: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const trashItems = articles.map((article) => {
      const remainingInfo = getTrashRemainingInfo(article.deletedAt!);
      const expiresAt = getTrashExpiryDate(article.deletedAt!);

      return {
        ...article,
        expiresAt: expiresAt.toISOString(),
        remainingLabel: remainingInfo.label,
        isExpired: remainingInfo.isExpired,
      };
    });

    return NextResponse.json({
      items: trashItems,
      total: trashItems.length,
    });
  } catch (error) {
    console.error("Error fetching trash articles:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar kotak sampah" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses khusus Super Admin" }, { status: 403 });
    }

    // Empty entire trash permanently
    const result = await db.article.deleteMany({
      where: {
        deletedAt: { not: null },
      },
    });

    return NextResponse.json({
      message: `Kotak sampah berhasil dikosongkan. ${result.count} artikel dihapus permanen.`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json({ error: "Gagal mengosongkan kotak sampah" }, { status: 500 });
  }
}
