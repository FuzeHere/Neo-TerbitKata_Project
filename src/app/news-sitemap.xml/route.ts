import { db } from "@/lib/db";
import { getStaticBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

/**
 * Google News Sitemap — dedicated sitemap for Google News indexing.
 *
 * Google News sitemaps are a specialised format that helps Google News
 * discover and index news articles faster (within minutes instead of hours).
 *
 * Key requirements:
 * - Only articles published within the last 48 hours (Google News guideline)
 * - Uses the `news:news` XML namespace
 * - Includes publication name, language, and publication date
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */
export async function GET() {
  const baseUrl = getStaticBaseUrl();

  // Google News sitemaps should only include articles from the last 48 hours
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

  let articles = await db.article.findMany({
    where: {
      publishedAt: { not: null, gte: twoDaysAgo },
      deletedAt: null,
    },
    orderBy: { publishedAt: "desc" },
    include: {
      categories: { select: { slug: true, name: true }, take: 1 },
    },
    take: 1000,
  });

  // Graceful fallback to latest published if no articles in the last 48 hours
  if (articles.length === 0) {
    articles = await db.article.findMany({
      where: {
        publishedAt: { not: null },
        deletedAt: null,
      },
      orderBy: { publishedAt: "desc" },
      include: {
        categories: { select: { slug: true, name: true }, take: 1 },
      },
      take: 10,
    });
  }

  const urlEntries = articles
    .map((article) => {
      const articleUrl = `${baseUrl}/${article.categories[0]?.slug || "berita"}/${article.slug}`;
      const pubDate = article.publishedAt
        ? article.publishedAt.toISOString()
        : new Date().toISOString();
      const title = article.title
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      return `
  <url>
    <loc>${articleUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>TerbitKata</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=900, stale-while-revalidate",
    },
  });
}
