import { describe, it, expect } from "vitest";
import { getStartOfWeek } from "@/lib/trending";

describe("Weekly Trending Logic", () => {
  it("should return the Monday 00:00:00 of the week for a given date", () => {
    // Wednesday Oct 14, 2026 at noon
    const wednesday = new Date(2026, 9, 14, 12, 0, 0);
    const monday = getStartOfWeek(wednesday);

    expect(monday.getDay()).toBe(1); // Monday
    expect(monday.getDate()).toBe(12);
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);
    expect(monday.getSeconds()).toBe(0);
    expect(monday.getMilliseconds()).toBe(0);
  });

  it("should handle Sunday correctly by returning the preceding Monday", () => {
    // Sunday Oct 18, 2026 at noon
    const sunday = new Date(2026, 9, 18, 12, 0, 0);
    const monday = getStartOfWeek(sunday);

    expect(monday.getDay()).toBe(1); // Monday
    expect(monday.getDate()).toBe(12);
  });

  it("should handle Monday itself correctly", () => {
    // Monday Oct 12, 2026 at 8 AM
    const mondayTest = new Date(2026, 9, 12, 8, 0, 0);
    const monday = getStartOfWeek(mondayTest);

    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(12);
  });
});
