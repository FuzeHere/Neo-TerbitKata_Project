import { describe, it, expect } from "vitest";
import { getTrashExpiryDate, getTrashRemainingInfo, TRASH_RETENTION_MS } from "@/lib/trash";

describe("Trash Retention & Expiry Logic", () => {
  it("should calculate expiry date exactly 3 days after deletion", () => {
    const deletedAt = new Date("2026-09-30T10:00:00Z");
    const expiryDate = getTrashExpiryDate(deletedAt);

    expect(expiryDate.getTime() - deletedAt.getTime()).toBe(3 * 24 * 60 * 60 * 1000);
    expect(expiryDate.toISOString()).toBe("2026-10-03T10:00:00.000Z");
  });

  it("should identify expired items if older than 3 days", () => {
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    const info = getTrashRemainingInfo(fourDaysAgo);

    expect(info.isExpired).toBe(true);
    expect(info.remainingMs).toBe(0);
    expect(info.label).toContain("Kedaluwarsa");
  });

  it("should format remaining days and hours when within 3 days", () => {
    // 1 day ago -> remaining is ~2 days
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const info = getTrashRemainingInfo(oneDayAgo);

    expect(info.isExpired).toBe(false);
    expect(info.remainingMs).toBeGreaterThan(0);
    expect(info.label).toMatch(/\d+ hari/);
  });

  it("should format remaining hours when less than a day left", () => {
    // 2.5 days ago -> remaining is ~12 hours
    const twoAndHalfDaysAgo = new Date(Date.now() - (2.5 * 24 * 60 * 60 * 1000));
    const info = getTrashRemainingInfo(twoAndHalfDaysAgo);

    expect(info.isExpired).toBe(false);
    expect(info.remainingMs).toBeGreaterThan(0);
    expect(info.label).toMatch(/\d+ jam lagi/);
  });
});
