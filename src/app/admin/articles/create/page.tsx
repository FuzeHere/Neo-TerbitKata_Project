import React from "react";
import { db } from "@/lib/db";
import ArticleForm from "@/components/admin/ArticleForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function CreateArticlePage() {
  const [categories, tags] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link 
          href="/admin/articles" 
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-center transition cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Tulis Artikel Baru</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Buat artikel berita berkualitas untuk portal TerbitKata.</p>
        </div>
      </div>

      <ArticleForm categories={categories} tags={tags} />
    </div>
  );
}
