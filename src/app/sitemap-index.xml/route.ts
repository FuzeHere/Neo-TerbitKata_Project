import { getStaticBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

/**
 * Sitemap Index — a master sitemap that references all sub-sitemaps.
 *
 * Google recommends using a sitemap index when you have multiple sitemaps
 * (e.g., a main sitemap + a Google News sitemap).
 *
 * This endpoint is what should be submitted to Google Search Console
 * under the Sitemaps section.
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps
 */
export async function GET() {
  const baseUrl = getStaticBaseUrl();
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/news-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
