import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getStaticBaseUrl, toAbsoluteUrl, getImageMimeType } from "@/lib/url";

describe("URL Utilities - toAbsoluteUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return unchanged if URL is already absolute (https)", () => {
    const external = "https://images.unsplash.com/photo-1504711434969-e33886168f5c";
    expect(toAbsoluteUrl(external)).toBe(external);
  });

  it("should return unchanged if URL is already absolute (http)", () => {
    const external = "http://example.com/photo.jpg";
    expect(toAbsoluteUrl(external)).toBe(external);
  });

  it("should convert protocol-relative URLs to https", () => {
    expect(toAbsoluteUrl("//example.com/photo.jpg")).toBe("https://example.com/photo.jpg");
  });

  it("should prepend base URL to local relative paths", () => {
    process.env.NEXTAUTH_URL = "https://terbitkata.xyz";
    expect(toAbsoluteUrl("/uploads/news-1.webp")).toBe("https://terbitkata.xyz/uploads/news-1.webp");
    expect(toAbsoluteUrl("uploads/news-2.png")).toBe("https://terbitkata.xyz/uploads/news-2.png");
  });

  it("should use custom baseUrl when provided", () => {
    expect(toAbsoluteUrl("/uploads/local.jpg", "https://terbitkata.xyz")).toBe("https://terbitkata.xyz/uploads/local.jpg");
  });

  it("should fallback to logo.png if path is null, undefined, or empty", () => {
    expect(toAbsoluteUrl(null, "https://terbitkata.xyz")).toBe("https://terbitkata.xyz/logo.png");
    expect(toAbsoluteUrl("", "https://terbitkata.xyz")).toBe("https://terbitkata.xyz/logo.png");
  });
});

describe("URL Utilities - getStaticBaseUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should respect NEXT_PUBLIC_SITE_URL first", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://terbitkata.xyz/";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    expect(getStaticBaseUrl()).toBe("https://terbitkata.xyz");
  });

  it("should use NEXTAUTH_URL if NEXT_PUBLIC_SITE_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXTAUTH_URL = "https://terbitkata.xyz";
    expect(getStaticBaseUrl()).toBe("https://terbitkata.xyz");
  });

  it("should fallback to terbitkata.xyz in production if env urls are missing", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
    Object.defineProperty(process.env, "NODE_ENV", { value: "production", writable: true, configurable: true });
    expect(getStaticBaseUrl()).toBe("https://terbitkata.xyz");
  });
});

describe("URL Utilities - getImageMimeType", () => {
  it("should correctly identify webp, png, gif, jpeg", () => {
    expect(getImageMimeType("https://terbitkata.xyz/uploads/sample.webp")).toBe("image/webp");
    expect(getImageMimeType("/uploads/sample.png?v=1")).toBe("image/png");
    expect(getImageMimeType("/uploads/sample.gif")).toBe("image/gif");
    expect(getImageMimeType("/uploads/sample.jpg")).toBe("image/jpeg");
    expect(getImageMimeType("/uploads/sample.jpeg")).toBe("image/jpeg");
    expect(getImageMimeType("https://terbitkata.xyz/uploads/sample.unknown")).toBe("image/jpeg");
  });
});

describe("Article Open Graph Metadata Resolution", () => {
  const baseUrl = "https://terbitkata.xyz";

  it("should format local upload thumbnail into absolute URL with full OG attributes", () => {
    const rawThumbnail = "/uploads/1782482718197-rzjpu49.webp";
    const ogImageUrl = toAbsoluteUrl(rawThumbnail, baseUrl);
    const mimeType = getImageMimeType(ogImageUrl);

    expect(ogImageUrl).toBe("https://terbitkata.xyz/uploads/1782482718197-rzjpu49.webp");
    expect(mimeType).toBe("image/webp");
  });

  it("should preserve external image URL as is", () => {
    const external = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
    const ogImageUrl = toAbsoluteUrl(external, baseUrl);

    expect(ogImageUrl).toBe(external);
  });

  it("should fallback to absolute logo.png when thumbnail is missing", () => {
    const ogImageUrl = toAbsoluteUrl(null, baseUrl);

    expect(ogImageUrl).toBe("https://terbitkata.xyz/logo.png");
  });
});
