"use client";

import React, { useState } from "react";
import { Bookmark, Share2, Check, Copy } from "lucide-react";

interface ArticleActionRailProps {
  title: string;
  url: string;
}

export default function ArticleActionRail({ title, url }: ArticleActionRailProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<"normal" | "large" | "xlarge">("normal");

  const getCleanUrl = () => {
    let activeUrl = url;
    if (typeof window !== "undefined") {
      if (url.includes("localhost") && !window.location.host.includes("localhost")) {
        activeUrl = window.location.href;
      } else if (!url.startsWith("http")) {
        activeUrl = window.location.href;
      }
    }
    return activeUrl.split("?")[0];
  };

  const handleShare = (platform: "whatsapp" | "facebook" | "x" | "telegram") => {
    const cleanUrl = getCleanUrl();
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${cleanUrl}`)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl)}`;
        break;
      case "x":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(cleanUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(cleanUrl)}&text=${encodeURIComponent(title)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCleanUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const toggleFontSize = () => {
    const nextLevel = fontSizeLevel === "normal" ? "large" : fontSizeLevel === "large" ? "xlarge" : "normal";
    setFontSizeLevel(nextLevel);
    const contentEl = document.querySelector(".article-content");
    if (contentEl) {
      contentEl.classList.remove("text-base", "text-lg", "text-xl", "text-2xl");
      if (nextLevel === "normal") {
        contentEl.classList.add("text-base", "sm:text-lg");
      } else if (nextLevel === "large") {
        contentEl.classList.add("text-lg", "sm:text-xl");
      } else {
        contentEl.classList.add("text-xl", "sm:text-2xl");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-2 px-1 text-slate-600 dark:text-slate-400 select-none">
      {/* Font Size Toggle "Aa" */}
      <button
        type="button"
        onClick={toggleFontSize}
        title="Ubah Ukuran Tulisan"
        className="w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition cursor-pointer border border-slate-200 dark:border-slate-800 bg-card shadow-xs"
      >
        A<span className="text-[10px] font-sans">a</span>
      </button>

      {/* Bookmark */}
      <button
        type="button"
        onClick={() => setBookmarked(!bookmarked)}
        title={bookmarked ? "Tersimpan" : "Simpan Berita"}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer border border-slate-200 dark:border-slate-800 bg-card shadow-xs ${
          bookmarked ? "text-primary bg-primary/10 border-primary/30" : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <Bookmark className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
      </button>

      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
        Bagikan
      </span>

      {/* WhatsApp */}
      <button
        type="button"
        onClick={() => handleShare("whatsapp")}
        title="Bagikan ke WhatsApp"
        className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-[#25D366] hover:brightness-105 transition cursor-pointer shadow-xs"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={() => handleShare("facebook")}
        title="Bagikan ke Facebook"
        className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-[#1877F2] hover:brightness-105 transition cursor-pointer shadow-xs"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
        </svg>
      </button>

      {/* X (Twitter) */}
      <button
        type="button"
        onClick={() => handleShare("x")}
        title="Bagikan ke X"
        className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-black hover:bg-slate-900 transition cursor-pointer shadow-xs"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Telegram */}
      <button
        type="button"
        onClick={() => handleShare("telegram")}
        title="Bagikan ke Telegram"
        className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-[#229ED9] hover:brightness-105 transition cursor-pointer shadow-xs"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </button>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        title="Salin Tautan"
        className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        )}
      </button>

      {/* Google News Box (like Tempo) */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
        <a
          href="https://news.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-slate-200 dark:border-slate-700 bg-card p-1.5 rounded-lg hover:border-primary transition flex flex-col items-center gap-1 group"
        >
          <span className="text-[9px] text-slate-500 group-hover:text-primary transition leading-tight">
            Ikuti kami di
          </span>
          <div className="flex items-center gap-0.5">
            <span className="text-[#4285F4] font-bold text-xs">G</span>
            <span className="text-[#EA4335] font-bold text-xs">o</span>
            <span className="text-[#FBBC05] font-bold text-xs">o</span>
            <span className="text-[#4285F4] font-bold text-xs">g</span>
            <span className="text-[#34A853] font-bold text-xs">l</span>
            <span className="text-[#EA4335] font-bold text-xs">e</span>
          </div>
        </a>
      </div>
    </div>
  );
}
