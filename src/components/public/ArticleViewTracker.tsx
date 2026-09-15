"use client";

import { useEffect } from "react";

interface ArticleViewTrackerProps {
  articleId: string;
}

export default function ArticleViewTracker({ articleId }: ArticleViewTrackerProps) {
  useEffect(() => {
    if (!articleId) return;

    // Timer berjalan selama 10 detik (10.000 ms).
    // Jika pengguna refresh atau keluar sebelum 10 detik, cleanup function akan membatalkan timer.
    const timer = setTimeout(() => {
      const storageKey = `terbitkata_viewed_${articleId}`;
      
      // Cegah penambahan berulang pada sesi tab yang sama
      if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey)) {
        return;
      }

      fetch(`/api/articles/${articleId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.ok && typeof window !== "undefined") {
            window.sessionStorage.setItem(storageKey, "true");
          }
        })
        .catch((err) => {
          console.warn("View tracker failed to send:", err);
        });
    }, 10000); // Tepat 10 detik

    return () => {
      // Pembaca keluar atau refresh sebelum 10 detik -> timer dibatalkan
      clearTimeout(timer);
    };
  }, [articleId]);

  return null;
}
