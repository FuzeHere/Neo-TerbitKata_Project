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
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 select-none w-full">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
        <Share2 className="h-3.5 w-3.5 text-primary" />
        <span>Bagikan:</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <a
          href={getTargetUrl("facebook")}
          onClick={(e) => handleClick(e, "facebook")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white transition shadow-xs cursor-pointer shrink-0"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </a>
        <a
          href={getTargetUrl("twitter")}
          onClick={(e) => handleClick(e, "twitter")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white transition shadow-xs cursor-pointer shrink-0"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </a>
        <a
          href={getTargetUrl("whatsapp")}
          onClick={(e) => handleClick(e, "whatsapp")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white transition shadow-xs cursor-pointer shrink-0"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.107.005.25.04.39.375.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.177.181-.076.355.101.173.45.742 1.065 1.29 1.155 1.031 2.128 1.349 2.43 1.48.303.13.479.116.657-.087.177-.202.766-.893.97-1.198.204-.304.406-.254.675-.154.269.101 1.706.804 2.001.951.295.147.491.22.563.342.072.123.072.712-.072 1.117z"/>
          </svg>
          WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition shadow-xs cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Salin Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
