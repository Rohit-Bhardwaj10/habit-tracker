import { describe, it, expect } from "vitest";
import { toLocalDay, isInLocalFuture, isBeforeHabitCreation } from "../../src/utils/localDay";

describe("toLocalDay — worked examples from assignment (Asia/Kolkata UTC+05:30)", () => {
  it("Check-in A: 2026-03-10T14:30Z → local 2026-03-10", () => {
    expect(toLocalDay(new Date("2026-03-10T14:30:00Z"), "Asia/Kolkata")).toBe("2026-03-10");
  });

  it("Check-in B: 2026-03-11T10:30Z → local 2026-03-11", () => {
    expect(toLocalDay(new Date("2026-03-11T10:30:00Z"), "Asia/Kolkata")).toBe("2026-03-11");
  });

  it("Check-in C: 2026-03-11T21:30Z → local 2026-03-12 (crosses midnight)", () => {
    expect(toLocalDay(new Date("2026-03-11T21:30:00Z"), "Asia/Kolkata")).toBe("2026-03-12");
  });

  it("Check-in D: 2026-03-12T17:30Z → local 2026-03-12 (SAME day as C = duplicate)", () => {
    const c = toLocalDay(new Date("2026-03-11T21:30:00Z"), "Asia/Kolkata");
    const d = toLocalDay(new Date("2026-03-12T17:30:00Z"), "Asia/Kolkata");
    expect(c).toBe(d); // Both resolve to 2026-03-12
  });

  it("B and C are 11h apart but produce DIFFERENT local days (streak = 2→3)", () => {
    const b = toLocalDay(new Date("2026-03-11T10:30:00Z"), "Asia/Kolkata");
    const c = toLocalDay(new Date("2026-03-11T21:30:00Z"), "Asia/Kolkata");
    expect(b).toBe("2026-03-11");
    expect(c).toBe("2026-03-12");
    expect(b).not.toBe(c);
  });
});

describe("toLocalDay — DST edge cases", () => {
  it("America/New_York spring-forward: both sides of 2am gap are still the same local day", () => {
    // 2026-03-08: clocks spring forward at 2am EST → 3am EDT
    const before = new Date("2026-03-08T06:59:00Z"); // 01:59 EST
    const after  = new Date("2026-03-08T07:01:00Z"); // 03:01 EDT
    expect(toLocalDay(before, "America/New_York")).toBe("2026-03-08");
    expect(toLocalDay(after,  "America/New_York")).toBe("2026-03-08");
  });

  it("America/New_York fall-back: both 1:30am occurrences are the same local day", () => {
    // 2026-11-01: clocks fall back at 2am EDT → 1am EST (1:30am exists twice)
    const firstTime  = new Date("2026-11-01T05:30:00Z"); // 1:30am EDT
    const secondTime = new Date("2026-11-01T06:30:00Z"); // 1:30am EST
    expect(toLocalDay(firstTime,  "America/New_York")).toBe("2026-11-01");
    expect(toLocalDay(secondTime, "America/New_York")).toBe("2026-11-01");
  });

  it("Asia/Kolkata half-hour offset (UTC+05:30) is handled correctly", () => {
    // 23:00 UTC = 04:30 IST next day
    const utc = new Date("2026-06-15T23:00:00Z");
    expect(toLocalDay(utc, "Asia/Kolkata")).toBe("2026-06-16");
  });
});

describe("Validation helpers", () => {
  it("isInLocalFuture rejects tomorrow's date", () => {
    expect(isInLocalFuture("2099-01-01", "Asia/Kolkata")).toBe(true);
  });

  it("isInLocalFuture accepts today and past dates", () => {
    expect(isInLocalFuture("2020-01-01", "Asia/Kolkata")).toBe(false);
  });

  it("isBeforeHabitCreation rejects day before creation", () => {
    const created = new Date("2026-03-10T00:00:00Z"); // local day 2026-03-10 in IST
    expect(isBeforeHabitCreation("2026-03-09", created, "Asia/Kolkata")).toBe(true);
    expect(isBeforeHabitCreation("2026-03-10", created, "Asia/Kolkata")).toBe(false);
  });
});
