"use client";

import React, { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

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

  const getTargetUrl = (platform: "facebook" | "twitter" | "whatsapp") => {
    const cleanUrl = getCleanUrl();

    switch (platform) {
      case "facebook": {
        const shareUrl = encodeURIComponent(`${cleanUrl}?utm_source=facebook`);
        return `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      }
      case "twitter": {
        const shareUrl = encodeURIComponent(`${cleanUrl}?utm_source=twitter`);
        const shareText = encodeURIComponent(title);
        return `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
      }
      case "whatsapp": {
        const shareUrl = `${cleanUrl}?utm_source=whatsapp`;
        const text = encodeURIComponent(`Cek selengkapnya di sini: ${shareUrl}`);
        return `https://api.whatsapp.com/send?text=${text}`;
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, platform: "facebook" | "twitter" | "whatsapp") => {
    e.preventDefault();
    const href = getTargetUrl(platform);
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    const cleanUrl = getCleanUrl();
    try {
      await navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = cleanUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 select-none flex-wrap">
      <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1 shrink-0">
        <Share2 className="h-3.5 w-3.5" /> Bagikan:
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        <a
          href={getTargetUrl("facebook")}
          onClick={(e) => handleClick(e, "facebook")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer whitespace-nowrap shrink-0"
        >
          Facebook
        </a>
        <a
          href={getTargetUrl("twitter")}
          onClick={(e) => handleClick(e, "twitter")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 hover:bg-black text-white transition cursor-pointer whitespace-nowrap shrink-0"
        >
          X
        </a>
        <a
          href={getTargetUrl("whatsapp")}
          onClick={(e) => handleClick(e, "whatsapp")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer whitespace-nowrap shrink-0"
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopyLink}
          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" /> Tersalin!
            </>
          ) : (
            <>
              <LinkIcon className="h-3 w-3" /> Salin Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
