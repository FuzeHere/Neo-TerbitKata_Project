import React from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import ArticleTable from "@/components/admin/ArticleTable";

export const revalidate = 0;

export default async function AdminArticlesPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const where: any = {
    deletedAt: null, // Only show active articles
  };
  
  // Writers can only manage their own articles
  if (role === "WRITER") {
    where.authorId = userId;
  }

  let trashCount = 0;
  if (role === "SUPER_ADMIN") {
    trashCount = await db.article.count({
      where: { deletedAt: { not: null } },
    });
  }

  const articles = await db.article.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      categories: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } }
    }
  });

  // Convert Date objects to strings for serialization to Client Components
  const serializedArticles = articles.map(article => ({
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Artikel</h1>
          <p className="text-muted-foreground">
            {role === "SUPER_ADMIN" 
              ? "Kelola semua artikel berita yang ada di portal." 
              : "Kelola artikel berita yang Anda tulis."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {role === "SUPER_ADMIN" && (
            <Link
              href="/admin/trash"
              className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm px-3.5 py-2 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4 text-slate-500" />
              Kotak Sampah
              {trashCount > 0 && (
                <span className="bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                  {trashCount}
                </span>
              )}
            </Link>
          )}
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-medium text-sm px-4 py-2 rounded-lg transition shadow-md shadow-primary/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tulis Artikel Baru
          </Link>
        </div>
      </div>

      {role === "SUPER_ADMIN" && trashCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Pemberitahuan Persetujuan Penghapusan
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ada {trashCount} artikel yang diajukan untuk dihapus dan berada di kotak sampah. Artikel akan terhapus otomatis jika melewati 3 hari.
              </p>
            </div>
          </div>
          <Link
            href="/admin/trash"
            className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition flex items-center gap-1 shrink-0"
          >
            Tinjau Kotak Sampah <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      <ArticleTable initialArticles={serializedArticles} userRole={role} />
    </div>
  );
}
