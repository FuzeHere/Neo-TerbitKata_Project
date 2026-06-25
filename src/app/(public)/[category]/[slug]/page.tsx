import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { Clock, User, Calendar, BookOpen } from "lucide-react";
import CommentSection from "@/components/public/CommentSection";
import ShareButtons from "@/components/public/ShareButtons";
import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 0;

interface ArticleDetailPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await db.article.findUnique({
    where: { slug: resolvedParams.slug },
    include: { categories: true }
  });

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan - TerbitKata",
    };
  }

  return {
    title: `${article.title} - TerbitKata`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: article.thumbnail ? [{ url: article.thumbnail }] : [],
    }
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
  const articleUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/${resolvedParams.category}/${resolvedParams.slug}`;

  // Serialize comments dates
  const serializedComments = article.comments.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString()
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "image": [
              article.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"
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
                "url": `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/logo.png`
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

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {article.title}
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed italic border-l-4 border-border pl-4 py-1">
          {article.excerpt}
        </p>

        {/* Author Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-y border-border py-4">
          <div className="flex items-center gap-3">
            <img 
              src={article.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
              alt={article.author.name}
              className="h-10 w-10 rounded-full border border-slate-200 object-cover"
            />
            <div>
              <p className="text-sm font-bold">{article.author.name}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(article.publishedAt)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {readingTime} Menit Baca</span>
              </div>
            </div>
          </div>

          <ShareButtons title={article.title} url={articleUrl} />
        </div>
      </div>

      {/* Featured Image */}
      {article.thumbnail && (
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border bg-muted">
          <img src={article.thumbnail} alt={article.title} className="object-cover w-full h-full" />
        </div>
      )}

      {/* Article Content */}
      <div 
        className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{ __html: article.content }}
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
      <CommentSection articleId={article.id} initialComments={serializedComments} />
    </article>
  </>
  );
}
