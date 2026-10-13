import { db } from "@/lib/db";
import { getStaticBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const articles = await db.article.findMany({
    where: { publishedAt: { not: null }, deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: {
      categories: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
    take: 100,
  });

  const baseUrl = getStaticBaseUrl();

  const xmlItems = articles
    .map((article) => {
      const url = `${baseUrl}/${article.categories[0]?.slug || "berita"}/${article.slug}`;
      const imageUrl = article.thumbnail
        ? (article.thumbnail.startsWith("http") ? article.thumbnail : `${baseUrl}${article.thumbnail.startsWith("/") ? "" : "/"}${article.thumbnail}`)
        : `${baseUrl}/logo.png`;

      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${article.publishedAt?.toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt || article.title}]]></description>
      <author>${article.author.name}</author>
      <category>${article.categories[0]?.name || "Berita"}</category>
      <enclosure url="${imageUrl}" type="image/jpeg" length="0" />
      <media:content url="${imageUrl}" medium="image" />
    </item>`;
    })
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>TerbitKata Portal Berita</title>
    <link>${baseUrl}</link>
    <description>Portal berita digital independen tepercaya</description>
    <language>id-id</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${xmlItems}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate"
    }
  });
}
