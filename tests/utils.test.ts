import { describe, it, expect } from "vitest";
import { calculateReadingTime, slugify, isSpam } from "@/lib/utils";

describe("Utils - calculateReadingTime", () => {
  it("should calculate reading time correctly for average words", () => {
    const text = "word ".repeat(200); // 200 words
    expect(calculateReadingTime(text)).toBe(1);

    const longerText = "word ".repeat(500); // 500 words
    expect(calculateReadingTime(longerText)).toBe(3); // Math.ceil(500/200) = 3
  });

  it("should return 0 or 1 for very short words", () => {
    expect(calculateReadingTime("short")).toBe(1);
    expect(calculateReadingTime("")).toBe(0);
  });
});

describe("Utils - slugify", () => {
  it("should convert text to lowercase URL friendly slugs", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("Berita & Opini Politik")).toBe("berita-dan-opini-politik");
    expect(slugify("  Sulawesi - Selatan!! ")).toBe("sulawesi-selatan");
  });
});

describe("Utils - isSpam", () => {
  const blacklist = ["slot online", "judi online"];

  it("should detect spam comments containing blacklisted keywords", () => {
    expect(isSpam("Mainkan SLOT online sekarang!", blacklist)).toBe(true);
    expect(isSpam("Situs judi online terpercaya", blacklist)).toBe(true);
  });

  it("should detect spam containing URLs", () => {
    expect(isSpam("Kunjungi website kami http://spam.com", blacklist)).toBe(true);
    expect(isSpam("https://trusted-site.com", blacklist)).toBe(true);
  });

  it("should pass normal constructive comments", () => {
    expect(isSpam("Artikel yang sangat mendalam dan informatif. Terima kasih editor!", blacklist)).toBe(false);
  });
});
