import React from "react";
import { getStaticBaseUrl } from "@/lib/url";
import { toAbsoluteUrl } from "@/lib/url";

interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string | null;
  publishedAt: Date | string;
  modifiedAt?: Date | string | null;
  authorName: string;
  categoryName?: string;
}

/**
 * Renders a JSON-LD structured data script tag for Google's NewsArticle schema.
 *
 * This is critical for Google indexing and Google News inclusion.
 * Google explicitly uses JSON-LD to understand article content, authorship,
 * publication dates, and publisher identity.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/article
 */
export default function ArticleJsonLd({
  title,
  description,
  url,
  thumbnailUrl,
  publishedAt,
  modifiedAt,
  authorName,
  categoryName,
}: ArticleJsonLdProps) {
  const baseUrl = getStaticBaseUrl();
  const imageUrl = toAbsoluteUrl(thumbnailUrl, baseUrl);
  const publishDate = publishedAt instanceof Date ? publishedAt.toISOString() : publishedAt;
  const modifiedDate = modifiedAt
    ? modifiedAt instanceof Date
      ? modifiedAt.toISOString()
      : modifiedAt
    : publishDate;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: publishDate,
    dateModified: modifiedDate,
    author: {
      "@type": "Person",
      name: authorName,
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "TerbitKata",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 200,
        height: 60,
      },
    },
    isAccessibleForFree: true,
    ...(categoryName && {
      articleSection: categoryName,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface WebsiteJsonLdProps {
  name?: string;
  description?: string;
}

/**
 * Renders Website-level JSON-LD for the homepage.
 * Helps Google establish the site identity, search action, and publisher info.
 */
export function WebsiteJsonLd({ name, description }: WebsiteJsonLdProps = {}) {
  const baseUrl = getStaticBaseUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: name || "TerbitKata",
    description:
      description ||
      "Portal berita digital independen terpercaya dengan berita teraktual dan mendalam.",
    url: baseUrl,
    publisher: {
      "@type": "Organization",
      name: "TerbitKata",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; url: string }>;
}

/**
 * Renders BreadcrumbList JSON-LD for hierarchical navigation.
 * Google uses this to show breadcrumbs in search results.
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
