import { MetadataRoute } from "next";
import { getStaticBaseUrl } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getStaticBaseUrl();

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot-News",
        allow: "/",
        disallow: ["/admin/", "/api/", "/search"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap-index.xml`,
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/news-sitemap.xml`,
      `${baseUrl}/feed.xml`,
    ],
  };
}
