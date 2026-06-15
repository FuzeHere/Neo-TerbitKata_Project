import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import HeaderSearch from "@/components/public/HeaderSearch";
import NewsletterForm from "@/components/public/NewsletterForm";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, session] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      take: 6
    }),
    getServerSession(authOptions)
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Banner */}
      <div className="bg-primary text-white text-[10px] font-semibold tracking-wider text-center py-2 px-4 select-none">
        PORTAL DIGITAL INFORMASI TERPERCAYA • JURNALISME BERKUALITAS & INDEPENDEN
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl sm:text-2xl tracking-tight shrink-0">
              <span className="bg-primary text-white px-2 py-0.5 rounded-lg text-lg sm:text-xl">TK</span>
              <span className="text-slate-900 dark:text-white">Terbit<span className="text-primary">Kata</span></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 overflow-x-auto py-1">
              <Link href="/" className="text-sm font-semibold hover:text-primary transition">Home</Link>
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/kategori/${cat.slug}`} 
                  className="text-sm font-semibold hover:text-primary transition whitespace-nowrap capitalize"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Header Interactions */}
            <div className="flex items-center gap-3">
              <HeaderSearch />
            </div>
          </div>

          {/* Mobile/Tablet Sub-Navigation Bar */}
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800/50 py-2.5 overflow-x-auto flex items-center gap-4 scrollbar-none">
            <Link href="/" className="text-xs font-semibold hover:text-primary transition whitespace-nowrap">Home</Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/kategori/${cat.slug}`} 
                className="text-xs font-semibold hover:text-primary transition whitespace-nowrap capitalize"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
              <span className="bg-primary text-white px-2 py-0.5 rounded-lg">TK</span>
              <span className="text-slate-900 dark:text-white">Terbit<span className="text-primary">Kata</span></span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              TerbitKata adalah portal berita digital modern yang menyajikan jurnalisme berkualitas, objektif, dan independen secara real-time dari seluruh nusantara.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Kanal Populer</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/kategori/${cat.slug}`} className="hover:text-primary transition capitalize">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Langganan Newsletter</h4>
            <p className="text-xs text-slate-500">Dapatkan rangkuman berita penting harian langsung ke email Anda.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} TerbitKata Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
