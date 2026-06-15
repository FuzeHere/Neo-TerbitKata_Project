"use client";

import React from "react";
import { Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const shareText = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`,
  };

  return (
    <div className="flex items-center gap-2 select-none">
      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5" /> Bagikan:
      </span>
      <div className="flex items-center gap-1.5">
        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
        >
          Facebook
        </a>
        {/* Twitter */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-900 hover:bg-black text-white transition cursor-pointer"
        >
          X (Twitter)
        </a>
        {/* WhatsApp */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
