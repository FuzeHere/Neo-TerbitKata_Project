import { db } from "@/lib/db";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const [articles, categories] = await Promise.all([
    db.article.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      include: { categories: { select: { slug: true } } },
      take: 100
    }),
    db.category.findMany({ select: { slug: true } })
  ]);

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticUrls = [
    { url: baseUrl, changefreq: "daily", priority: "1.0" },
    { url: `${baseUrl}/search`, changefreq: "weekly", priority: "0.5" }
  ];

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/kategori/${cat.slug}`,
    changefreq: "weekly",
    priority: "0.8"
  }));

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/${article.categories[0]?.slug || "berita"}/${article.slug}`,
    changefreq: "monthly",
    priority: "0.6"
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...articleUrls];

  const xmlUrls = allUrls
    .map((item) => `
  <url>
    <loc>${item.url}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`)
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate"
    }
  });
}
