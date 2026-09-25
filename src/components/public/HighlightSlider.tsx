"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Clock, Sparkles, Flame } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface HighlightItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  publishedAt: Date | string | null;
  views?: number;
  highlightType: "PILIHAN UTAMA" | "PALING BANYAK DIBACA";
  author: {
    name: string;
    avatar: string | null;
  };
  categories: {
    name: string;
    slug: string;
  }[];
}

interface HighlightSliderProps {
  highlights: HighlightItem[];
}

export default function HighlightSlider({ highlights }: HighlightSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const count = highlights.length;

  // Auto-scroll every 2 seconds (2000ms)
  useEffect(() => {
    if (count <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, 2000);

    return () => clearInterval(interval);
  }, [count, isPaused]);

  if (!highlights || highlights.length === 0) return null;

  const currentArticle = highlights[currentIndex];
  const defaultThumb =
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % count);
  };

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Main Slide Card */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm transition">
        <div className="grid md:grid-cols-12 gap-0 items-stretch min-h-[380px] md:min-h-[440px]">
          {/* Slide Image (7 cols) */}
          <div className="relative md:col-span-7 aspect-[16/10] md:aspect-auto w-full h-full min-h-[260px] overflow-hidden group">
            <Link
              href={`/${currentArticle.categories[0]?.slug || "berita"}/${currentArticle.slug}`}
              className="block w-full h-full relative"
            >
              <Image
                src={currentArticle.thumbnail || defaultThumb}
                alt={currentArticle.title}
                fill
                preload
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover group-hover:scale-102 transition duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
            </Link>

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                  currentArticle.highlightType === "PALING BANYAK DIBACA"
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "bg-red-600 text-white"
                }`}
              >
                {currentArticle.highlightType === "PALING BANYAK DIBACA" ? (
                  <>
                    <Flame className="w-3 h-3 fill-current" /> Paling Banyak Dibaca
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" /> Pilihan Utama
                  </>
                )}
              </span>

              {currentArticle.categories[0] && (
                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {currentArticle.categories[0].name}
                </span>
              )}
            </div>

            {/* Prev / Next Arrows */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Slide"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide Content (5 cols) */}
          <div className="p-6 md:p-8 md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold uppercase tracking-wider text-red-600">
                  {currentArticle.highlightType}
                </span>
                <span className="text-[11px] font-semibold bg-muted px-2 py-0.5 rounded-full">
                  {currentIndex + 1} / {count}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white hover:text-primary transition leading-snug">
                <Link
                  href={`/${currentArticle.categories[0]?.slug || "berita"}/${currentArticle.slug}`}
                >
                  {currentArticle.title}
                </Link>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
                {currentArticle.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Image
                  src={
                    currentArticle.author.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"
                  }
                  alt={currentArticle.author.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border border-slate-200 object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground">
                    {currentArticle.author.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentArticle.publishedAt ? formatDate(currentArticle.publishedAt) : "Baru"}
                  </p>
                </div>
              </div>

              <Link
                href={`/${currentArticle.categories[0]?.slug || "berita"}/${currentArticle.slug}`}
                className="text-xs font-bold text-red-600 hover:underline shrink-0"
              >
                Baca →
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Second Animated Progress Bar */}
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            key={currentIndex}
            className={`h-full bg-red-600 transition-all ${
              isPaused ? "w-full" : "w-full animate-[progress_2s_linear]"
            }`}
            style={{
              animationDuration: "2000ms",
            }}
          />
        </div>
      </div>

      {/* 3 Sub-headlines / Mini-selector Tabs (Exactly matching Image 3 under the main headline!) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {highlights.map((item, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                isActive
                  ? "border-red-600 bg-red-50/50 dark:bg-red-950/20 shadow-xs"
                  : "border-border bg-card hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <span
                className={`font-black text-xs shrink-0 mt-0.5 ${
                  isActive ? "text-red-600" : "text-slate-400"
                }`}
              >
                ■
              </span>
              <div className="min-w-0 space-y-1">
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider block ${
                    isActive ? "text-red-600" : "text-muted-foreground"
                  }`}
                >
                  {item.highlightType}
                </span>
                <p
                  className={`text-xs font-bold line-clamp-2 leading-snug ${
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {item.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
