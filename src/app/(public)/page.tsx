import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Clock, User, ArrowRight, MessageSquare } from "lucide-react";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { Metadata } from "next";

export const revalidate = 0; // Ensure fresh data on every load

export const metadata: Metadata = {
  title: "TerbitKata - Portal Berita Digital Independen Terpercaya",
  description: "TerbitKata menyajikan berita terkini secara aktual, tepercaya, dan mendalam seputar politik, ekonomi, opini, gaya hidup, dan teknologi.",
  keywords: ["portal berita", "berita hari ini", "terbitkata", "berita indonesia", "jurnalisme independen"],
  openGraph: {
    title: "TerbitKata - Portal Berita Digital Independen Terpercaya",
    description: "TerbitKata menyajikan berita terkini secara aktual, tepercaya, dan mendalam.",
    type: "website",
    locale: "id_ID"
  }
};

export default async function Homepage() {
  // Find the featured published article (if any)
  let heroArticle = await db.article.findFirst({
    where: {
      publishedAt: { not: null },
      isFeatured: true
    },
    include: {
      author: { select: { name: true, avatar: true } },
      categories: { select: { name: true, slug: true } },
      _count: { select: { comments: { where: { status: "APPROVED" } } } }
    }
  });

  // Fetch latest published articles (excluding the hero article if it was found)
  const gridArticles = await db.article.findMany({
    where: {
      publishedAt: { not: null },
      ...(heroArticle ? { id: { not: heroArticle.id } } : {})
    },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { name: true, avatar: true } },
      categories: { select: { name: true, slug: true } },
      _count: { select: { comments: { where: { status: "APPROVED" } } } }
    },
    take: heroArticle ? 6 : 7
  });

  const categories = await db.category.findMany({
    take: 4,
    include: {
      _count: { select: { articles: { where: { publishedAt: { not: null } } } } }
    }
  });

  // Fallback to the latest article as hero if no specific article is featured
  if (!heroArticle && gridArticles.length > 0) {
    heroArticle = gridArticles[0];
    gridArticles.shift();
  }

  if (!heroArticle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Belum Ada Artikel Dipublikasikan</h2>
        <p className="text-slate-500 max-w-md mx-auto">Editor kami sedang mempersiapkan berita-berita berkualitas untuk Anda. Kunjungi kembali beberapa saat lagi.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section (Featured Article) */}
      <section className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-md">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-video md:aspect-auto w-full md:h-full md:min-h-[400px]">
            <img 
              src={heroArticle.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"} 
              alt={heroArticle.title}
              className="object-cover w-full h-full"
            />
            {heroArticle.categories[0] && (
              <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {heroArticle.categories[0].name}
              </span>
            )}
          </div>
          <div className="p-6 md:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs text-primary font-bold tracking-widest uppercase">Pilihan Utama</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white hover:text-primary transition leading-tight">
                <Link href={`/${heroArticle.categories[0]?.slug || "berita"}/${heroArticle.slug}`}>
                  {heroArticle.title}
                </Link>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                {heroArticle.excerpt}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <img 
                  src={heroArticle.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
                  alt={heroArticle.author.name}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <p className="text-xs font-semibold">{heroArticle.author.name}</p>
                  <p className="text-[10px] text-slate-555 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDate(heroArticle.publishedAt!)}
                  </p>
                </div>
              </div>

              <Link 
                href={`/${heroArticle.categories[0]?.slug || "berita"}/${heroArticle.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
              >
                Baca Selengkapnya <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/kategori/${cat.slug}`}
            className="p-4 rounded-xl border border-border bg-card flex items-center justify-between hover:border-primary dark:hover:border-primary transition"
          >
            <div>
              <h4 className="font-semibold text-sm capitalize">{cat.name}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{cat._count.articles} Berita</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
        ))}
      </section>

      {/* Grid of Latest Articles & Sidebar */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Latest Articles */}
        <section className="lg:col-span-2 space-y-6">
          <div className="border-b border-border pb-3 flex justify-between items-center">
            <h3 className="font-bold text-lg text-foreground tracking-tight">Berita Terkini</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {gridArticles.map((article) => (
              <article 
                key={article.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
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
                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 mt-4 text-[10px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{article.author.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {formatDate(article.publishedAt!)}</span>
                    {article._count.comments > 0 && (
                      <span className="flex items-center gap-0.5 text-primary"><MessageSquare className="h-3 w-3" /> {article._count.comments}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Misi TerbitKata</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kami berkomitmen untuk mempersembahkan informasi akurat dan seimbang kepada seluruh masyarakat, demi terwujudnya ruang publik yang sehat dan beradab.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Materi Opini</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tertarik untuk berkontribusi mengirimkan opini Anda? Hubungi redaksi TerbitKata di <strong>redaksi@terbitkata.com</strong>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
