import React from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const article = await db.article.findUnique({
    where: { id: resolvedParams.id },
    include: {
      categories: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } }
    }
  });

  if (!article) {
    notFound();
  }

  // Permission check: WRITER cannot edit other people's articles
  if (role === "WRITER" && article.authorId !== userId) {
    redirect("/admin/articles");
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Artikel</h1>
          <p className="text-muted-foreground">Sesuaikan isi atau pengaturan artikel berita Anda.</p>
        </div>
      </div>

      <ArticleForm categories={categories} tags={tags} article={article} />
    </div>
  );
}
