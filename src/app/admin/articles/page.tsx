import React from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import ArticleTable from "@/components/admin/ArticleTable";

export const revalidate = 0;

export default async function AdminArticlesPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const where: any = {};
  
  // Writers can only manage their own articles
  if (role === "WRITER") {
    where.authorId = userId;
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
        <Link
          href="/admin/articles/create"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-medium text-sm px-4 py-2 rounded-lg transition shadow-md shadow-primary/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tulis Artikel Baru
        </Link>
      </div>

      <ArticleTable initialArticles={serializedArticles} />
    </div>
  );
}
