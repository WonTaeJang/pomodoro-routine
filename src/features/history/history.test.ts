import { describe, expect, it } from "vitest";
import { getTodayFocus } from "./store";

const MIN = 60_000;

describe("오늘 기록", () => {
  it("오늘 끝난 집중 세션과 사이클만 센다", () => {
    const now = new Date(2026, 10, 7, 15, 0).getTime();
    const yesterday = new Date(2026, 10, 6, 23, 50).getTime();
    const morning = new Date(2026, 10, 7, 9, 25).getTime();
    const sessions = [
      { mode: "focus" as const, endedAt: yesterday, durationMs: 25 * MIN },
      { mode: "focus" as const, endedAt: morning, durationMs: 25 * MIN },
      {
        mode: "short-break" as const,
        endedAt: morning + 5 * MIN,
        durationMs: 5 * MIN,
      },
      {
        mode: "focus" as const,
        endedAt: morning + 30 * MIN,
        durationMs: 50 * MIN,
        cycleCompleted: true,
      },
    ];
    expect(getTodayFocus(sessions, now)).toEqual({
      count: 2,
      minutes: 75,
      cycles: 1,
    });
  });
});
