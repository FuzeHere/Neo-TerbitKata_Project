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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link 
          href="/admin/articles" 
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tulis Artikel Baru</h1>
          <p className="text-muted-foreground">Buat artikel berita berkualitas untuk portal TerbitKata.</p>
        </div>
      </div>

      <ArticleForm categories={categories} tags={tags} />
    </div>
  );
}
