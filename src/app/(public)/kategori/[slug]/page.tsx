import React from "react";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, FolderX } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import { getStaticBaseUrl } from "@/lib/url";

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const baseUrl = getStaticBaseUrl();
  const category = await db.category.findUnique({
    where: { slug: resolvedParams.slug }
  });

  if (!category) {
    const tag = await db.tag.findUnique({
      where: { slug: resolvedParams.slug },
    });
    if (tag) {
      return {
        title: `Topik #${tag.name} - TerbitKata`,
        alternates: {
          canonical: `${baseUrl}/kategori/${resolvedParams.slug}`,
        },
      };
    }
    return { title: "Kategori Tidak Ditemukan - TerbitKata" };
  }

  const title = `Berita Seputar ${category.name} - TerbitKata`;
  const description = category.description || `Kumpulan berita terupdate seputar ${category.name} di TerbitKata.`;
  const canonicalUrl = `${baseUrl}/kategori/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/logo.png",
          width: 800,
          height: 600,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const category = await db.category.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      articles: {
        where: { publishedAt: { not: null }, deletedAt: null },
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true } },
          categories: { select: { name: true, slug: true } }
        }
      }
    }
  });

  if (!category) {
    // If slug matches a tag (e.g. 'investasi'), gracefully redirect to /tag/slug
    const tag = await db.tag.findUnique({
      where: { slug: resolvedParams.slug }
    });
    if (tag) {
      redirect(`/tag/${tag.slug}`);
    }

    // Otherwise render a helpful category fallback with available categories
    const allCategories = await db.category.findMany({
      orderBy: { name: "asc" },
      take: 8
    });

    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <FolderX className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Kategori Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Kategori &ldquo;{resolvedParams.slug}&rdquo; tidak ditemukan atau sedang dalam proses pembaruan oleh redaksi.
        </p>
        <div className="pt-4 space-y-3">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Pilih kategori berita lainnya:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {allCategories.map((c) => (
              <Link
                key={c.id}
                href={`/kategori/${c.slug}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-primary hover:text-white dark:bg-slate-800 transition"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="pt-6">
          <Link
            href="/"
            className="inline-block text-xs font-bold text-primary hover:underline"
          >
            ← Kembali ke Beranda TerbitKata
          </Link>
        </div>
      </div>
    );
  }

  const articles = category.articles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Category Header */}
      <div className="border-b border-border pb-6 space-y-2">
        <div className="text-xs text-slate-500 font-medium capitalize">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-400">Kategori</span>
        </div>
        <h1 className="text-3xl font-extrabold capitalize text-slate-900 dark:text-white">
          Kategori: {category.name}
        </h1>
        {category.description && (
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Article Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          Belum ada berita di kategori ini.
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
                  <Image 
                    src={article.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80"} 
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white hover:text-primary transition line-clamp-2 leading-snug">
                  <Link href={`/${article.categories[0]?.slug || category.slug || "berita"}/${article.slug}`}>
                    {article.title}
                  </Link>
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4 mt-4 text-[10px] text-muted-foreground">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{article.author.name}</span>
                <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {article.publishedAt ? formatDate(article.publishedAt) : ""}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
