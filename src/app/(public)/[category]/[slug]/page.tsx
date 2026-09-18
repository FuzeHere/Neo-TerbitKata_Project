import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { Clock, Calendar, Eye } from "lucide-react";
import CommentSection from "@/components/public/CommentSection";
import ShareButtons from "@/components/public/ShareButtons";
import ArticleViewTracker from "@/components/public/ArticleViewTracker";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getServerBaseUrl, toAbsoluteUrl, getImageMimeType } from "@/lib/url";

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
  // Route through /api/og to guarantee 1200x630 JPEG format under 200KB for WhatsApp, Facebook, and Twitter
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
            "image": [
              absoluteThumbnail
            ],
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
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium capitalize">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <span>/</span>
        <Link href={`/kategori/${article.categories[0]?.slug}`} className="hover:text-primary transition">
          {article.categories[0]?.name || "Berita"}
        </Link>
        <span>/</span>
        <span className="text-slate-400 truncate max-w-[200px]">{article.title}</span>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {article.categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/kategori/${cat.slug}`}
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider hover:bg-primary/20 transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {article.title}
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed italic bg-slate-50 dark:bg-slate-900/40 border-l-4 border-primary pl-4 pr-3 py-2.5 rounded-r-lg">
          {article.excerpt}
        </p>

        {/* Author Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-y border-border py-4">
          <div className="flex items-center gap-3">
            <Image 
              src={article.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
              alt={article.author.name}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border border-slate-200 object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{article.author.name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> {formatDate(article.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Clock className="h-3.5 w-3.5 text-primary" /> {readingTime} Menit Baca
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Eye className="h-3.5 w-3.5 text-primary" /> {article.views ?? 0} Kali Dibaca
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
            <ShareButtons title={article.title} url={articleUrl} />
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {article.thumbnail && (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-muted">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            preload
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div 
        className="article-content max-w-none text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
      />

      {/* Tags list */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-6 border-t border-border">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">Tag:</span>
          {article.tags.map((tag) => (
            <Link 
              key={tag.id} 
              href={`/tag/${tag.slug}`}
              className="text-xs font-medium px-3 py-1 rounded-lg border border-border hover:border-primary dark:hover:border-primary transition"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Comments Section */}
      <CommentSection articleId={article.id} initialComments={serializedComments} authorName={article.author.name} />
    </article>
  </>
  );
}
