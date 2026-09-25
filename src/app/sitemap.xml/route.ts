import { db } from "@/lib/db";
import { getStaticBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const [articles, categories, tags] = await Promise.all([
    db.article.findMany({
      where: { publishedAt: { not: null } },
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

  const baseUrl = getStaticBaseUrl();
  const now = new Date().toISOString();

  const staticUrls = [
    { url: baseUrl, lastmod: now, changefreq: "daily", priority: "1.0" },
    { url: `${baseUrl}/search`, lastmod: now, changefreq: "weekly", priority: "0.5" },
  ];

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/kategori/${cat.slug}`,
    lastmod: now,
    changefreq: "daily",
    priority: "0.8",
  }));

  const tagUrls = tags.map((t) => ({
    url: `${baseUrl}/tag/${t.slug}`,
    lastmod: now,
    changefreq: "weekly",
    priority: "0.6",
  }));

  const articleUrls = articles.map((article) => {
    const lastmodDate = article.updatedAt || article.publishedAt || new Date();
    return {
      url: `${baseUrl}/${article.categories[0]?.slug || "berita"}/${article.slug}`,
      lastmod: new Date(lastmodDate).toISOString(),
      changefreq: "monthly",
      priority: "0.7",
    };
  });

  const allUrls = [...staticUrls, ...categoryUrls, ...tagUrls, ...articleUrls];

  const xmlUrls = allUrls
    .map(
      (item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
