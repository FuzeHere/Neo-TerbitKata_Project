import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface SidebarArticle {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  publishedAt: Date | string | null;
  views?: number;
  categories: { name: string; slug: string }[];
}

interface ArticleSidebarProps {
  latestArticles: SidebarArticle[];
  trendingArticles: SidebarArticle[];
}

export default function ArticleSidebar({
  latestArticles,
  trendingArticles,
}: ArticleSidebarProps) {
  const defaultThumb =
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=300&q=80";

  return (
    <aside className="space-y-8">
      {/* ARTIKEL TERBARU */}
      <div className="space-y-4">
        <div className="border-b-2 border-slate-900 dark:border-white pb-2 flex items-center justify-between">
          <h3 className="font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-primary inline-block"></span>
            Artikel Terbaru
          </h3>
        </div>

        <div className="divide-y divide-border/60">
          {latestArticles.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 group">
              <Link
                href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}
                className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-muted border border-border"
              >
                <Image
                  src={item.thumbnail || defaultThumb}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </Link>
              <div className="min-w-0 flex-1 space-y-1">
                {item.categories[0] && (
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                    {item.categories[0].name}
                  </span>
                )}
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary transition line-clamp-3 leading-snug">
                  <Link href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}>
                    {item.title}
                  </Link>
                </h4>
                {item.publishedAt && (
                  <span className="text-[10px] text-muted-foreground block">
                    {formatDate(item.publishedAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTIKEL TRENDING */}
      <div className="space-y-4 pt-2">
        <div className="border-b-2 border-slate-900 dark:border-white pb-2 flex items-center justify-between">
          <h3 className="font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-primary inline-block"></span>
            Artikel Trending
          </h3>
        </div>

        <div className="divide-y divide-border/60">
          {trendingArticles.map((item, index) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 group">
              <Link
                href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}
                className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-muted border border-border"
              >
                <Image
                  src={item.thumbnail || defaultThumb}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute bottom-1 left-1 bg-primary text-white font-bold text-[9px] w-4 h-4 rounded-xs flex items-center justify-center">
                  {index + 1}
                </span>
              </Link>
              <div className="min-w-0 flex-1 space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary transition line-clamp-3 leading-snug">
                  <Link
                    href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}
                    className="flex items-start gap-1"
                  >
                    <span className="text-primary font-extrabold text-xs inline-block shrink-0 mt-0.5">
                      ■
                    </span>
                    <span>{item.title}</span>
                  </Link>
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {item.categories[0] && (
                    <span className="text-slate-500 font-medium">
                      {item.categories[0].name}
                    </span>
                  )}
                  {item.views !== undefined && item.views > 0 && (
                    <span>• {item.views} dibaca</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor's Opini / Misi Sidebar Card */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-2">
        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
          Kolom Opini & Narasi Publik
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Kirim gagasan dan opini berkualitas Anda untuk dimuat di TerbitKata melalui{" "}
          <strong className="text-foreground">redaksi@terbitkata.com</strong>.
        </p>
      </div>
    </aside>
  );
}
