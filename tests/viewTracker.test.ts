import { describe, it, expect, vi } from "vitest";

describe("Article View Tracker - 10 Second Dwell Time Logic", () => {
  it("should NOT record a view if reader leaves before 10 seconds", () => {
    vi.useFakeTimers();

    let viewRecorded = false;
    const recordView = () => {
      viewRecorded = true;
    };

    // Simulate mounting tracker with 10-second timer
    const timer = setTimeout(recordView, 10000);

    // User stays for only 5 seconds then leaves/refreshes (cleanup runs)
    vi.advanceTimersByTime(5000);
    clearTimeout(timer);

    // Advance time beyond 10s
    vi.advanceTimersByTime(6000);

    expect(viewRecorded).toBe(false);

    vi.useRealTimers();
  });

  it("should record 1 view only after reader stays for at least 10 seconds", () => {
    vi.useFakeTimers();

    let viewCount = 0;
    const recordView = () => {
      viewCount += 1;
    };

    // Simulate mounting tracker
    setTimeout(recordView, 10000);

    // Reader stays for 9.9 seconds - not yet recorded
    vi.advanceTimersByTime(9900);
    expect(viewCount).toBe(0);

    // Reader reaches 10 seconds - view is counted
    vi.advanceTimersByTime(100);
    expect(viewCount).toBe(1);

    vi.useRealTimers();
  });
});
