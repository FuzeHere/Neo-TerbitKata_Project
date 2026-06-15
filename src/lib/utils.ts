import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function calculateReadingTime(text: string): number {
  if (!text || !text.trim()) return 0;
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-dan-") // Replace & with 'dan'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export function isSpam(content: string, blacklistKeywords: string[]): boolean {
  if (!content) return false;
  
  const text = content.toLowerCase();
  
  // 1. Check if contains URL (common spam patterns)
  if (text.includes("http://") || text.includes("https://")) {
    return true;
  }
  
  // 2. Check blacklist keywords
  for (const keyword of blacklistKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}
