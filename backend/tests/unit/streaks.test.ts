import { describe, it, expect } from "vitest";
import { computeStreaks } from "../../src/utils/streaks";

const TODAY = "2026-03-12";
const YESTERDAY = "2026-03-11";

describe("computeStreaks — worked examples from assignment", () => {
  it("empty history → 0, 0", () => {
    expect(computeStreaks([], TODAY, YESTERDAY)).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it("A+B+C = 3 consecutive days → streak 3", () => {
    const days = ["2026-03-10", "2026-03-11", "2026-03-12"];
    expect(computeStreaks(days, TODAY, YESTERDAY)).toEqual({ currentStreak: 3, longestStreak: 3 });
  });

  it("D is a duplicate of C → deduplicated, streak stays 3", () => {
    // C and D both map to 2026-03-12
    const days = ["2026-03-10", "2026-03-11", "2026-03-12", "2026-03-12"];
    expect(computeStreaks(days, TODAY, YESTERDAY)).toEqual({ currentStreak: 3, longestStreak: 3 });
  });
});

describe("computeStreaks — streak liveness", () => {
  it("streak alive when today not logged but yesterday was", () => {
    const days = ["2026-03-09", "2026-03-10", "2026-03-11"]; // yesterday = last
    expect(computeStreaks(days, TODAY, YESTERDAY)).toEqual({ currentStreak: 3, longestStreak: 3 });
  });

  it("streak dead when last check-in is before yesterday", () => {
    const days = ["2026-03-09", "2026-03-10"]; // last < yesterday
    expect(computeStreaks(days, TODAY, YESTERDAY)).toEqual({ currentStreak: 0, longestStreak: 2 });
  });

  it("single check-in today → 1, 1", () => {
    expect(computeStreaks(["2026-03-12"], TODAY, YESTERDAY)).toEqual({ currentStreak: 1, longestStreak: 1 });
  });
});

describe("computeStreaks — backfill recomputation", () => {
  it("backfill bridges a gap and increases longest streak", () => {
    // Before backfill: [Mar1,Mar2,Mar3] gap [Mar7,Mar8,Mar9,Mar10,Mar11]
    const days = [
      "2026-03-01","2026-03-02","2026-03-03",
      "2026-03-07","2026-03-08","2026-03-09","2026-03-10","2026-03-11",
    ];
    const result = computeStreaks(days, TODAY, YESTERDAY);
    expect(result.longestStreak).toBe(5);
    expect(result.currentStreak).toBe(5); // ends yesterday
  });

  it("backfilling a gap day creates one long streak", () => {
    // Gap at Mar11 — fill it → 3+1+rest becomes one run
    const withGap    = ["2026-03-09","2026-03-10","2026-03-12"];
    const withBackfill = ["2026-03-09","2026-03-10","2026-03-11","2026-03-12"];
    const before = computeStreaks(withGap, TODAY, YESTERDAY);
    const after  = computeStreaks(withBackfill, TODAY, YESTERDAY);
    expect(before.currentStreak).toBe(1);  // only today
    expect(after.currentStreak).toBe(4);   // all 4 consecutive
  });
});

describe("computeStreaks — DST: 23-hour day (spring-forward)", () => {
  it("consecutive days across DST spring-forward count correctly", () => {
    // daysBetween uses UTC midnight arithmetic — DST never affects the diff
    const days = ["2026-03-07","2026-03-08","2026-03-09"]; // Mar 8 = spring-forward day in US
    expect(computeStreaks(days, "2026-03-09", "2026-03-08"))
      .toEqual({ currentStreak: 3, longestStreak: 3 });
  });
});
