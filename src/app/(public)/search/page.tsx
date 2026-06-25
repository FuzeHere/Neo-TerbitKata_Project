import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";

export const revalidate = 0;

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  return {
    title: query ? `Hasil Pencarian untuk "${query}" - TerbitKata` : "Pencarian Berita - TerbitKata",
    description: `Cari berita terhangat dan artikel mendalam di portal berita digital TerbitKata.`
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  const articles = query
    ? await db.article.findMany({
        where: {
          publishedAt: { not: null },
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } }
          ]
        },
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true } },
          categories: { select: { name: true, slug: true } }
        }
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="border-b border-border pb-6 space-y-2">
        <div className="text-xs text-slate-500 font-medium capitalize">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-400">Pencarian</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {query ? `Hasil Pencarian: "${query}"` : "Pencarian Berita"}
        </h1>
        <p className="text-slate-500 text-xs font-semibold">
          Ditemukan {articles.length} artikel yang relevan
        </p>
      </div>

      {/* Article Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 text-slate-500 space-y-2">
          <p className="text-sm font-semibold">Tidak ada berita yang cocok dengan kata kunci Anda.</p>
          <p className="text-xs">Cobalah cari dengan kata kunci lain seperti &apos;politik&apos;, &apos;makassar&apos;, atau nama tokoh.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article 
              key={article.id}
              className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border">
                  <img 
                    src={article.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80"} 
                    alt={article.title}
                    className="object-cover w-full h-full"
                  />
                  {article.categories[0] && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {article.categories[0].name}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white hover:text-primary transition line-clamp-2 leading-snug">
                  <Link href={`/${article.categories[0]?.slug || "berita"}/${article.slug}`}>
                    {article.title}
                  </Link>
                </h4>
                <p className="text-slate-550 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4 mt-4 text-[10px] text-muted-foreground">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{article.author.name}</span>
                <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {formatDate(article.publishedAt!)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
