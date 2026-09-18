/**
 * Helper utility to manage and resolve URLs for SEO, Open Graph, and WhatsApp sharing.
 */

export function getStaticBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  if (process.env.NODE_ENV === "production") {
    return "https://terbitkata.xyz";
  }

  return "http://localhost:3000";
}

/**
 * Resolves the active base URL dynamically in Server Components / Server Actions.
 * Checks request headers (e.g. when behind reverse proxy, ngrok, or custom domain)
 * before falling back to configured environment variables.
 */
export async function getServerBaseUrl(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

    if (host && !host.includes("localhost:3000")) {
      return `${proto}://${host}`.replace(/\/+$/, "");
    }
  } catch {
    // If called outside server request context or during static generation
  }

  return getStaticBaseUrl();
}

/**
 * Converts any relative path or external URL to a full, valid absolute URL.
 * Essential for WhatsApp, Facebook, and Twitter crawlers that require complete https:// URLs.
 */
export function toAbsoluteUrl(pathOrUrl?: string | null, baseUrl?: string): string {
  const base = (baseUrl || getStaticBaseUrl()).replace(/\/+$/, "");

  if (!pathOrUrl || !pathOrUrl.trim()) {
    return `${base}/logo.png`;
  }

  const trimmed = pathOrUrl.trim();

  // Already absolute URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Protocol-relative URL
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // Local relative path (e.g. /uploads/image.webp or uploads/image.webp)
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${normalizedPath}`;
}

/**
 * Determines MIME type based on image file extension for og:image:type
 */
export function getImageMimeType(url: string): string {
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".webp")) return "image/webp";
  if (cleanUrl.endsWith(".png")) return "image/png";
  if (cleanUrl.endsWith(".gif")) return "image/gif";
  if (cleanUrl.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}
