/**
 * Automated search engine indexing utilities.
 *
 * - IndexNow: Instant notification to Bing, Yandex, DuckDuckGo, Yahoo,
 *   Naver, and AI search engines (ChatGPT Search, Microsoft Copilot, Perplexity).
 *
 * Note: Google's sitemap ping endpoint (/ping?sitemap=...) was permanently deprecated
 * by Google in December 2023. For Google, automated discovery now relies on:
 * 1. Google News Sitemap (/news-sitemap.xml)
 * 2. Master Sitemap Index (/sitemap-index.xml)
 * 3. High-frequency RSS Feed (/feed.xml) with media enclosures
 * 4. Google Publisher Center integration
 */

import { getStaticBaseUrl } from "@/lib/url";

export const DEFAULT_INDEXNOW_KEY = "e8a1d7c3b4f6291a8e5d3c7b1a4f9e20";
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;

const SITE_HOST = (() => {
  try {
    return new URL(getStaticBaseUrl()).hostname;
  } catch {
    return "terbitkata.xyz";
  }
})();

/**
 * Ping IndexNow API to instantly notify Bing, DuckDuckGo, Yandex, and AI search
 * engines (ChatGPT Search, Copilot, etc.) about new or updated URLs.
 */
export async function pingIndexNow(urls: string | string[]): Promise<boolean> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  if (urlList.length === 0) return false;

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${SITE_HOST}/indexnow-key.txt`,
        urlList,
      }),
    });

    if (response.ok || response.status === 202) {
      console.log("[IndexNow] Ping successful:", urlList);
      return true;
    }

    console.error("[IndexNow] Ping failed:", response.status, await response.text());
    return false;
  } catch (error) {
    console.error("[IndexNow] Error:", error);
    return false;
  }
}

/**
 * Notify search engines about new or updated content.
 * Called automatically when articles are published or updated.
 */
export async function notifySearchEngines(articleUrls: string | string[]): Promise<void> {
  const urls = Array.isArray(articleUrls) ? articleUrls : [articleUrls];

  // Run pings in the background without blocking API response
  try {
    await pingIndexNow(urls);
  } catch (error) {
    console.error("[SearchEngineNotify] Error:", error);
  }
}
