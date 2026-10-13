import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import HeaderSearch from "@/components/public/HeaderSearch";
import NewsletterForm from "@/components/public/NewsletterForm";
import { Mail } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Top Banner */}
      <div className="bg-primary text-white text-[10px] font-semibold tracking-wider text-center py-2 px-4 select-none">
        PORTAL DIGITAL INFORMASI TERPERCAYA • JURNALISME BERKUALITAS & INDEPENDEN
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="TerbitKata Logo"
                width={180}
                height={36}
                className="h-9 w-auto object-contain"
                preload
              />
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
      <main className="flex-1 bg-background">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Tentang Kami (About Us) */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="TerbitKata Logo"
                width={180}
                height={36}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              TerbitKata adalah portal berita digital modern yang menyajikan jurnalisme berkualitas, objektif, dan independen secara real-time dari seluruh nusantara.
            </p>
            <Link
              href="/tentang-kami"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Tentang Kami &rarr;
            </Link>
          </div>

          {/* Column 2: Hubungi Kami & Kontak */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Kontak & Redaksi</h4>
            <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-400">Email Redaksi & Support:</span>
                  <a
                    href="mailto:terbitkatasupport@gmail.com"
                    className="font-semibold text-slate-800 dark:text-slate-200 hover:text-primary transition break-all"
                  >
                    terbitkatasupport@gmail.com
                  </a>
                </div>
              </div>
              <ul className="space-y-1.5 pt-1">
                <li>
                  <Link href="/tentang-kami" className="hover:text-primary transition">
                    Profil Redaksi
                  </Link>
                </li>
                <li>
                  <Link href="/tentang-kami" className="hover:text-primary transition">
                    Pedoman Media Siber
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Kanal Populer */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Kanal Populer</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/kategori/${cat.slug}`} className="hover:text-primary transition capitalize">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Langganan Newsletter */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Langganan Newsletter</h4>
            <p className="text-xs text-slate-500">Dapatkan rangkuman berita penting harian langsung ke email Anda.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-border py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} TerbitKata Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
