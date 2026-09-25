import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import HighlightSlider, { HighlightItem } from "@/components/public/HighlightSlider";

export const revalidate = 0; // Ensure fresh data on every load

export const metadata: Metadata = {
  title: "TerbitKata - Portal Berita Digital Independen Terpercaya",
  description:
    "TerbitKata menyajikan berita terkini secara aktual, tepercaya, dan mendalam seputar politik, ekonomi, opini, gaya hidup, dan teknologi nusantara.",
  keywords: [
    "portal berita",
    "berita hari ini",
    "terbitkata",
    "berita indonesia",
    "jurnalisme independen",
    "sulawesi",
    "politik",
    "ekonomi",
  ],
  openGraph: {
    title: "TerbitKata - Portal Berita Digital Independen Terpercaya",
    description: "TerbitKata menyajikan berita terkini secara aktual, tepercaya, dan mendalam.",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "TerbitKata Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TerbitKata - Portal Berita Digital Independen Terpercaya",
    description: "TerbitKata menyajikan berita terkini secara aktual, tepercaya, dan mendalam.",
    images: ["/logo.png"],
  },
};

export default async function Homepage() {
  const defaultThumb =
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";

  // Fetch Highlight Articles (Requirement: Exactly 3 items: 2 manual highlights + 1 most read)
  // Step A: 2 manual highlights
  let manualFeatured = await db.article.findMany({
    where: {
      publishedAt: { not: null },
      isFeatured: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 2,
    include: {
      author: { select: { name: true, avatar: true } },
      categories: { select: { name: true, slug: true } },
    },
  });

  // If fewer than 2 manual featured, fill from latest published articles
  if (manualFeatured.length < 2) {
    const existingIds = manualFeatured.map((a) => a.id);
    const fillerArticles = await db.article.findMany({
      where: {
        publishedAt: { not: null },
        id: { notIn: existingIds },
      },
      orderBy: { publishedAt: "desc" },
      take: 2 - manualFeatured.length,
      include: {
        author: { select: { name: true, avatar: true } },
        categories: { select: { name: true, slug: true } },
      },
    });
    manualFeatured = [...manualFeatured, ...fillerArticles];
  }

  // Step B: 1 most read (paling banyak dibaca), excluding manual highlights
  const manualFeaturedIds = manualFeatured.map((a) => a.id);
  let mostReadArticle = await db.article.findFirst({
    where: {
      publishedAt: { not: null },
      id: { notIn: manualFeaturedIds },
    },
    orderBy: { views: "desc" },
    include: {
      author: { select: { name: true, avatar: true } },
      categories: { select: { name: true, slug: true } },
    },
  });

  // If no additional article found, fallback to any available
  if (!mostReadArticle && manualFeatured.length > 0) {
    mostReadArticle = manualFeatured[0];
  }

  // Build the 3 highlights for the 2-second slider
  const highlightItems: HighlightItem[] = [
    ...manualFeatured.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      thumbnail: a.thumbnail,
      publishedAt: a.publishedAt,
      views: a.views,
      highlightType: "PILIHAN UTAMA" as const,
      author: a.author,
      categories: a.categories,
    })),
    ...(mostReadArticle
      ? [
          {
            id: mostReadArticle.id,
            title: mostReadArticle.title,
            slug: mostReadArticle.slug,
            excerpt: mostReadArticle.excerpt,
            thumbnail: mostReadArticle.thumbnail,
            publishedAt: mostReadArticle.publishedAt,
            views: mostReadArticle.views,
            highlightType: "PALING BANYAK DIBACA" as const,
            author: mostReadArticle.author,
            categories: mostReadArticle.categories,
          },
        ]
      : []),
  ].slice(0, 3);

  // 3. Fetch ARTIKEL TRENDING (Top 5 articles by views)
  const trendingArticles = await db.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { views: "desc" },
    take: 5,
    include: {
      author: { select: { name: true, avatar: true } },
      categories: { select: { name: true, slug: true } },
    },
  });

  // Trending layout: 4 list items on left, 1 main large card on right (Image 3)
  const topTrending = trendingArticles[0] || highlightItems[0];
  const sideTrending = trendingArticles.length > 1 ? trendingArticles.slice(1, 5) : trendingArticles;

  // 4. Fetch DARI TERBITKATA PLUS / FOKUS UTAMA (3 articles)
  const plusArticles = await db.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      categories: { select: { name: true, slug: true } },
    },
  });

  // 5. Fetch ARTIKEL TERBARU (Latest 5 articles)
  const latestArticles = await db.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: {
      author: { select: { name: true, avatar: true } },
      categories: { select: { name: true, slug: true } },
    },
  });

  const mainLatest = latestArticles[0] || highlightItems[0];
  const sideLatest = latestArticles.length > 1 ? latestArticles.slice(1, 5) : latestArticles;

  // 6. Fetch KOLOM / OPINI (3 articles or opinion pieces)
  const opinionArticles = await db.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "asc" },
    take: 3,
    include: {
      author: { select: { name: true, avatar: true } },
      categories: { select: { name: true, slug: true } },
    },
  });

  if (highlightItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Belum Ada Artikel Dipublikasikan</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Editor kami sedang mempersiapkan berita-berita berkualitas untuk Anda. Kunjungi kembali
          beberapa saat lagi.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* 1. Headline Carousel (Auto-sliding every 5s, 3 highlights: 2 manual + 1 top read) */}
      <section aria-label="Sorotan Berita Utama">
        <HighlightSlider highlights={highlightItems} />
      </section>

      {/* 2. ARTIKEL TRENDING (Image 3 Section: Left 4 list items, Right 1 large card) */}
      <section className="space-y-6 pt-2">
        <div className="border-b-2 border-slate-900 dark:border-white pb-2 flex items-center justify-between">
          <h2 className="font-black text-lg sm:text-xl tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 bg-primary inline-block"></span>
            Artikel Trending
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 4 Trending List Items (6 cols) */}
          <div className="lg:col-span-6 divide-y divide-border/60">
            {sideTrending.map((item, index) => (
              <article
                key={item.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4 group"
              >
                <Link
                  href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-md overflow-hidden bg-muted border border-border"
                >
                  <Image
                    src={item.thumbnail || defaultThumb}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute bottom-1 left-1 bg-primary text-white font-black text-[10px] w-5 h-5 rounded-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                </Link>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-primary transition leading-snug line-clamp-2">
                    <Link
                      href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}
                      className="flex items-start gap-1.5"
                    >
                      <span className="text-primary font-black text-xs inline-block shrink-0 mt-0.5">
                        ■
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {item.categories[0] && (
                      <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                        {item.categories[0].name}
                      </span>
                    )}
                    {item.publishedAt && <span>• {formatDate(item.publishedAt)}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Right Column: Featured Trending Story with Big Photo (6 cols) */}
          {topTrending && (
            <div className="lg:col-span-6 bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-md transition">
              <Link
                href={`/${topTrending.categories[0]?.slug || "berita"}/${topTrending.slug}`}
                className="relative aspect-[16/10] w-full block overflow-hidden"
              >
                <Image
                  src={topTrending.thumbnail || defaultThumb}
                  alt={topTrending.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-103 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-sm shadow-sm flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Trending Top #1
                </span>
              </Link>

              <div className="p-5 sm:p-6 space-y-3">
                <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition leading-tight">
                  <Link
                    href={`/${topTrending.categories[0]?.slug || "berita"}/${topTrending.slug}`}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary font-black text-sm inline-block shrink-0 mt-1">
                      ■
                    </span>
                    <span>{topTrending.title}</span>
                  </Link>
                </h3>

                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {topTrending.excerpt}
                </p>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {topTrending.author?.name}
                  </span>
                  <span>{topTrending.views ?? 0} kali dibaca</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. DARI TERBITKATA PLUS (Dark Banner Section - Matches Image 3 "DARI TEMPO PLUS") */}
      <section className="rounded-2xl bg-slate-950 text-white p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-primary inline-block"></span>
            <h2 className="font-black text-base sm:text-lg uppercase tracking-wider text-white">
              Dari TerbitKata Plus
            </h2>
          </div>
          <Link
            href="/kategori/investasi"
            className="text-xs font-bold text-slate-400 hover:text-primary transition flex items-center gap-1"
          >
            Jelajahi TerbitKata Plus <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plusArticles.map((item) => (
            <article key={item.id} className="space-y-3 group">
              <Link
                href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}
                className="relative aspect-video w-full rounded-xl overflow-hidden block bg-slate-900 border border-slate-800"
              >
                <Image
                  src={item.thumbnail || defaultThumb}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                {item.categories[0] && (
                  <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-xs">
                    {item.categories[0].name}
                  </span>
                )}
              </Link>
              <h3 className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-primary/90 transition leading-snug line-clamp-2">
                <Link href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}>
                  {item.title}
                </Link>
              </h3>
            </article>
          ))}
        </div>
      </section>

      {/* 4. ARTIKEL TERBARU (Matches Image 3 Section: Left Big Article, Right 4 Stacks) */}
      <section className="space-y-6">
        <div className="border-b-2 border-slate-900 dark:border-white pb-2 flex items-center justify-between">
          <h2 className="font-black text-lg sm:text-xl tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 bg-primary inline-block"></span>
            Artikel Terbaru
          </h2>
          <Link
            href="/search"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big Featured Recent Article (6 cols) */}
          {mainLatest && (
            <div className="lg:col-span-6 bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-md transition">
              <Link
                href={`/${mainLatest.categories[0]?.slug || "berita"}/${mainLatest.slug}`}
                className="relative aspect-[16/10] w-full block overflow-hidden"
              >
                <Image
                  src={mainLatest.thumbnail || defaultThumb}
                  alt={mainLatest.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-103 transition duration-500"
                />
                {mainLatest.categories[0] && (
                  <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-sm shadow-sm">
                    {mainLatest.categories[0].name}
                  </span>
                )}
              </Link>

              <div className="p-5 sm:p-6 space-y-3">
                <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition leading-tight">
                  <Link
                    href={`/${mainLatest.categories[0]?.slug || "berita"}/${mainLatest.slug}`}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary font-black text-sm inline-block shrink-0 mt-1">
                      ■
                    </span>
                    <span>{mainLatest.title}</span>
                  </Link>
                </h3>

                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {mainLatest.excerpt}
                </p>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {mainLatest.author?.name}
                  </span>
                  {mainLatest.publishedAt && (
                    <span>{formatDate(mainLatest.publishedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Column: 4 Recent Stacked Articles with Thumbnails (6 cols) */}
          <div className="lg:col-span-6 divide-y divide-border/60">
            {sideLatest.map((item) => (
              <article
                key={item.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4 group"
              >
                <Link
                  href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-md overflow-hidden bg-muted border border-border"
                >
                  <Image
                    src={item.thumbnail || defaultThumb}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </Link>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-primary transition leading-snug line-clamp-2">
                    <Link
                      href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}
                      className="flex items-start gap-1.5"
                    >
                      <span className="text-primary font-black text-xs inline-block shrink-0 mt-0.5">
                        ■
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {item.categories[0] && (
                      <span className="font-semibold text-primary uppercase tracking-wider text-[10px]">
                        {item.categories[0].name}
                      </span>
                    )}
                    {item.publishedAt && <span>• {formatDate(item.publishedAt)}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. KOLOM / MATERI OPINI (Matches Image 3 Bottom Section: KOLOM) */}
      <section className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-black text-lg sm:text-xl tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-primary inline-block"></span>
              Kolom Opini
            </h2>
            <p className="text-xs text-muted-foreground">
              Perspektif yang tajam dan apik dari para pakar dan jurnalis TerbitKata
            </p>
          </div>
          <Link
            href="/kategori/opini"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Kolom Lain <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {opinionArticles.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border bg-card space-y-3 hover:border-primary/40 transition"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={
                    item.author.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"
                  }
                  alt={item.author.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">
                    {item.author.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">Kolumnis TerbitKata</p>
                </div>
              </div>

              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-primary transition line-clamp-2 leading-snug">
                <Link href={`/${item.categories[0]?.slug || "berita"}/${item.slug}`}>
                  {item.title}
                </Link>
              </h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
