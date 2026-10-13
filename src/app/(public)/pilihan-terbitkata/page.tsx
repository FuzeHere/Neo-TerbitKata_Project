import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Clock, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import { getStaticBaseUrl } from "@/lib/url";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Pilihan TerbitKata - Artikel & Berita Pilihan Redaksi",
  description: "Kumpulan artikel dan liputan mendalam pilihan redaksi TerbitKata.",
  alternates: {
    canonical: `${getStaticBaseUrl()}/pilihan-terbitkata`,
  },
};

export default async function PilihanTerbitKataPage() {
  const activePublishedFilter = {
    publishedAt: { not: null },
    deletedAt: null,
  };

  // Fetch articles chosen by editor
  let articles = await db.article.findMany({
    where: {
      ...activePublishedFilter,
      isEditorChoice: true,
    },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { name: true } },
      categories: { select: { name: true, slug: true } },
    },
  });

  // If none explicitly selected yet, fallback to latest published
  if (articles.length === 0) {
    articles = await db.article.findMany({
      where: activePublishedFilter,
      orderBy: { publishedAt: "desc" },
      take: 12,
      include: {
        author: { select: { name: true } },
        categories: { select: { name: true, slug: true } },
      },
    });
  }

  const defaultThumb =
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6 space-y-3">
        <div className="text-xs text-slate-500 font-medium capitalize">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-400">Pilihan TerbitKata</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Pilihan TerbitKata
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
          Kumpulan liputan pilihan dan investigasi mendalam yang dikurasi khusus oleh tim redaksi TerbitKata.
        </p>
      </div>

      {/* Article Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          Belum ada artikel di Pilihan TerbitKata.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md transition group"
            >
              <div className="space-y-3">
                <Link
                  href={`/${article.categories[0]?.slug || "berita"}/${article.slug}`}
                  className="relative aspect-video w-full rounded-lg overflow-hidden border border-border block bg-slate-900"
                >
                  <Image
                    src={article.thumbnail || defaultThumb}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  {article.categories[0] && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-xs">
                      {article.categories[0].name}
                    </span>
                  )}
                </Link>

                <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary transition line-clamp-2 leading-snug">
                  <Link href={`/${article.categories[0]?.slug || "berita"}/${article.slug}`}>
                    {article.title}
                  </Link>
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4 mt-4 text-[10px] text-muted-foreground">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {article.author.name}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />{" "}
                  {article.publishedAt ? formatDate(article.publishedAt) : ""}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
