import { db } from "@/lib/db";
import { getStaticBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

/**
 * Main sitemap route handler.
 * Serves XML directly with proper Content-Type and Cache-Control headers.
 * Resolves the Google Search Console "Couldn't fetch" error seen with Next.js metadata sitemaps (issue #75836).
 */
export async function GET() {
  const baseUrl = getStaticBaseUrl();
  const now = new Date().toISOString();

  const [articles, categories, tags] = await Promise.all([
    db.article.findMany({
      where: { publishedAt: { not: null }, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        publishedAt: true,
        updatedAt: true,
        categories: { select: { slug: true }, take: 1 },
      },
      take: 5000,
    }),
    db.category.findMany({ select: { slug: true } }),
    db.tag.findMany({ select: { slug: true } }),
  ]);

  const staticUrls = [
    { url: `${baseUrl}/`, priority: "1.0", changefreq: "daily", lastmod: now },
    { url: `${baseUrl}/pilihan-terbitkata`, priority: "0.9", changefreq: "daily", lastmod: now },
    { url: `${baseUrl}/tentang-kami`, priority: "0.8", changefreq: "monthly", lastmod: now },
  ];

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/kategori/${cat.slug}`,
    priority: "0.8",
    changefreq: "daily",
    lastmod: now,
  }));

  const tagUrls = tags.map((t) => ({
    url: `${baseUrl}/tag/${t.slug}`,
    priority: "0.6",
    changefreq: "weekly",
    lastmod: now,
  }));

  const articleUrls = articles.map((article) => {
    const catSlug = article.categories[0]?.slug || "berita";
    const lastModDate = article.updatedAt || article.publishedAt || new Date();
    return {
      url: `${baseUrl}/${catSlug}/${article.slug}`,
      priority: "0.7",
      changefreq: "monthly",
      lastmod: lastModDate.toISOString(),
    };
  });

  const allEntries = [...staticUrls, ...categoryUrls, ...tagUrls, ...articleUrls];

  const xmlEntries = allEntries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
