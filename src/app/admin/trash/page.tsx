import React from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TrashTable, { TrashItem } from "@/components/admin/TrashTable";
import { cleanupExpiredTrash, getTrashExpiryDate, getTrashRemainingInfo } from "@/lib/trash";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function AdminTrashPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;
  if (role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  // Clean up any items older than 3 days
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

  const serializedItems: TrashItem[] = articles.map((article) => {
    const remainingInfo = getTrashRemainingInfo(article.deletedAt!);
    const expiresAt = getTrashExpiryDate(article.deletedAt!);

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      thumbnail: article.thumbnail,
      deletedAt: article.deletedAt!.toISOString(),
      createdAt: article.createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      remainingLabel: remainingInfo.label,
      isExpired: remainingInfo.isExpired,
      author: {
        id: article.author.id,
        name: article.author.name,
        avatar: article.author.avatar,
        email: article.author.email,
      },
      categories: article.categories,
      tags: article.tags,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kotak Sampah Artikel</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tinjau, intervensi pemulihan, atau setujui penghapusan artikel yang diajukan oleh penulis.
            </p>
          </div>
        </div>
      </div>

      <TrashTable initialItems={serializedItems} />
    </div>
  );
}
