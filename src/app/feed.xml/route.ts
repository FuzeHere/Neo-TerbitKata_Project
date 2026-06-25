import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const articles = await db.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    include: {
      categories: { select: { name: true, slug: true } },
      author: { select: { name: true } }
    },
    take: 20
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const xmlItems = articles
    .map((article) => {
      const url = `${baseUrl}/${article.categories[0]?.slug || "berita"}/${article.slug}`;
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${article.publishedAt?.toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt}]]></description>
      <author>${article.author.name}</author>
      <category>${article.categories[0]?.name || "Berita"}</category>
    </item>`;
    })
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
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
