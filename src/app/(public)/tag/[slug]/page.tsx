import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";

export const revalidate = 0;

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tag = await db.tag.findUnique({
    where: { slug: resolvedParams.slug }
  });

  if (!tag) {
    return { title: "Tag Tidak Ditemukan - TerbitKata" };
  }

  return {
    title: `Berita dengan Tag #${tag.name} - TerbitKata`,
    description: `Daftar berita terbaru yang diberi tag #${tag.name} di TerbitKata.`
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const resolvedParams = await params;
  const tag = await db.tag.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      articles: {
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true } },
          categories: { select: { name: true, slug: true } }
        }
      }
    }
  });

  if (!tag) {
    notFound();
  }

  const articles = tag.articles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Tag Header */}
      <div className="border-b border-border pb-6 space-y-2">
        <div className="text-xs text-slate-500 font-medium capitalize">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-400">Tag</span>
        </div>
        <h1 className="text-3xl font-extrabold capitalize text-slate-900 dark:text-white">
          Tag: #{tag.name}
        </h1>
      </div>

      {/* Article Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          Belum ada berita dengan tag ini.
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
