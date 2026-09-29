import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getStaticBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getStaticBaseUrl();
  const now = new Date();

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

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/${article.categories[0]?.slug || "berita"}/${article.slug}`,
    lastModified: article.updatedAt || article.publishedAt || now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/kategori/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${baseUrl}/tag/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...categoryEntries,
    ...tagEntries,
    ...articleEntries,
  ];
}
