import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { Clock, Calendar, Eye, ShieldCheck, CheckCircle2 } from "lucide-react";
import CommentSection from "@/components/public/CommentSection";
import ShareButtons from "@/components/public/ShareButtons";
import ArticleViewTracker from "@/components/public/ArticleViewTracker";
import ArticleSidebar from "@/components/public/ArticleSidebar";
import ArticleActionRail from "@/components/public/ArticleActionRail";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getServerBaseUrl, toAbsoluteUrl } from "@/lib/url";

export const revalidate = 0;

interface ArticleDetailPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await db.article.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      categories: true,
      author: { select: { name: true } },
    },
  });

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan - TerbitKata",
    };
  }

  const baseUrl = await getServerBaseUrl();
  const canonicalUrl = `${baseUrl}/${resolvedParams.category}/${article.slug}`;
  const rawOgImageUrl = toAbsoluteUrl(
    article.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?fm=jpg&fit=crop&w=1200&h=630&q=80",
    baseUrl
  );
  const ogImageUrl = `${baseUrl}/api/og?url=${encodeURIComponent(rawOgImageUrl)}`;
  const description = article.excerpt || `Baca artikel "${article.title}" selengkapnya di TerbitKata.`;

  return {
    title: `${article.title} - TerbitKata`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description,
      url: canonicalUrl,
      siteName: "TerbitKata",
      locale: "id_ID",
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      authors: article.author ? [article.author.name] : [],
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl.startsWith("https://") ? ogImageUrl : undefined,
          width: 1200,
          height: 630,
          alt: article.title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const resolvedParams = await params;
  const article = await db.article.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      author: { select: { name: true, avatar: true } },
      categories: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true, slug: true } },
      comments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!article || !article.publishedAt) {
    notFound();
  }

  // Fetch Side Content Articles (matching Image 1: ARTIKEL TERBARU & ARTIKEL TRENDING)
  const [latestArticles, trendingArticles] = await Promise.all([
    db.article.findMany({
      where: {
        publishedAt: { not: null },
        id: { not: article.id }
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        publishedAt: true,
        views: true,
        categories: { select: { name: true, slug: true } }
      }
    }),
    db.article.findMany({
      where: {
        publishedAt: { not: null },
        id: { not: article.id }
      },
      orderBy: { views: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        publishedAt: true,
        views: true,
        categories: { select: { name: true, slug: true } }
      }
    })
  ]);

  const readingTime = calculateReadingTime(article.content);
  const baseUrl = await getServerBaseUrl();
  const articleUrl = `${baseUrl}/${resolvedParams.category}/${resolvedParams.slug}`;
  const absoluteThumbnail = toAbsoluteUrl(
    article.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    baseUrl
  );

  // Serialize comments dates
  const serializedComments = article.comments.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString()
  }));

  const primaryCategory = article.categories[0] || { name: "Berita", slug: "berita" };

  return (
    <>
      <ArticleViewTracker articleId={article.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "image": [absoluteThumbnail],
            "datePublished": article.publishedAt.toISOString(),
            "dateModified": article.updatedAt.toISOString(),
            "author": {
              "@type": "Person",
              "name": article.author.name
            },
            "publisher": {
              "@type": "Organization",
              "name": "TerbitKata",
              "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
              }
            },
            "description": article.excerpt
          })
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Article Column (Matches Image 1 Left Side) */}
          <article className="lg:col-span-8 space-y-6">
            {/* Top Category and Badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/kategori/${primaryCategory.slug}`}
                  className="text-xs font-bold text-red-600 hover:underline uppercase tracking-wider"
                >
                  {primaryCategory.name}
                </Link>
              </div>

              {/* INFO TERBITKATA Badge */}
              <div className="pt-0.5">
                <span className="inline-block bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-sm tracking-wider uppercase">
                  INFO TERBITKATA
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.25] tracking-tight">
              {article.title}
            </h1>

            {/* Excerpt / Lead Paragraph */}
            {article.excerpt && (
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                {article.excerpt}
              </p>
            )}

            {/* Date, Time & Trust Indicator (as seen in Image 1) */}
            <div className="space-y-1.5 pt-1 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{formatDate(article.publishedAt)}</span>
                <span>•</span>
                <span>{readingTime} Menit Baca</span>
                <span>•</span>
                <span>{article.views ?? 0} Kali Dibaca</span>
              </div>
              <div>
                <a
                  href="#trust"
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-primary transition underline decoration-dotted text-[11px]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Mengapa TerbitKata bisa dipercaya
                </a>
              </div>
            </div>

            {/* Featured Image and Action Rail */}
            <div className="space-y-4">
              {article.thumbnail && (
                <figure className="space-y-2">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-muted">
                    <Image
                      src={article.thumbnail}
                      alt={article.thumbnailCaption || article.title}
                      fill
                      preload
                      sizes="(max-width: 1024px) 100vw, 850px"
                      className="object-cover"
                    />
                  </div>
                  {article.thumbnailCaption && (
                    <figcaption className="text-xs text-slate-500 dark:text-slate-400 italic px-1 leading-relaxed">
                      {article.thumbnailCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Author byline */}
              <div className="flex items-center gap-3 py-3 border-y border-border">
                <Image
                  src={article.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                  alt={article.author.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {article.author.name}
                  </p>
                  <p className="text-[10px] text-slate-500">Jurnalis TerbitKata</p>
                </div>
                <div className="sm:hidden">
                  <ShareButtons title={article.title} url={articleUrl} />
                </div>
              </div>

              {/* Content area with Side Action Rail (matching Image 1 floating toolbar) */}
              <div className="flex items-start gap-6 pt-2">
                {/* Desktop Side Action Rail */}
                <div className="hidden sm:block sticky top-24 shrink-0">
                  <ArticleActionRail title={article.title} url={articleUrl} />
                </div>

                {/* Article Rich Text Content */}
                <div className="flex-1 min-w-0 space-y-6">
                  <div
                    className="article-content max-w-none text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
                  />

                  {/* Tags list */}
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-6 border-t border-border">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Tag:
                      </span>
                      {article.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/tag/${tag.slug}`}
                          className="text-xs font-medium px-2.5 py-1 rounded-md border border-border hover:border-primary dark:hover:border-primary transition"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Trust Footer Box */}
                  <div id="trust" className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                    <h5 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Standar Jurnalisme TerbitKata
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Laporan ini disusun dengan verifikasi berimbang, mematuhi kode etik jurnalistik dan standar verifikasi independen demi menyajikan fakta yang akurat bagi publik.
                    </p>
                  </div>

                  {/* Comments Section */}
                  <CommentSection
                    articleId={article.id}
                    initialComments={serializedComments}
                    authorName={article.author.name}
                  />
                </div>
              </div>
            </div>
          </article>

          {/* Right Sidebar Column (Matches Image 1 Right Side Content) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20">
              <ArticleSidebar
                latestArticles={latestArticles}
                trendingArticles={trendingArticles}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
