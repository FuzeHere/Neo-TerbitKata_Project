"use client";

import React from "react";
import { Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const getTargetUrl = (platform: "facebook" | "twitter" | "whatsapp") => {
    let activeUrl = url;
    if (typeof window !== "undefined") {
      if (url.includes("localhost") && !window.location.host.includes("localhost")) {
        activeUrl = window.location.href;
      } else if (!url.startsWith("http")) {
        activeUrl = window.location.href;
      }
    }

    const shareText = encodeURIComponent(title);
    const shareUrl = encodeURIComponent(activeUrl);

    switch (platform) {
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      case "twitter":
        return `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
      case "whatsapp":
        return `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, platform: "facebook" | "twitter" | "whatsapp") => {
    e.preventDefault();
    const href = getTargetUrl(platform);
    window.open(href, "_blank", "noopener,noreferrer");
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
      </div>
    </div>
  );
}
