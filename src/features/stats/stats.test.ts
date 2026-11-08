import { describe, expect, it } from "vitest";
import { getDayStats } from "@/features/history/sessions";
import type { CompletedSession } from "@/features/timer/types";
import { getRecentComparison, getRecentDays, getStreak } from "./stats";

const MIN = 60_000;
// 2026년 11월: 1일이 일요일
const at = (d: number, h: number, m = 0) =>
  new Date(2026, 10, d, h, m).getTime();
const day = (d: number) => at(d, 0);
const focus = (
  endedAt: number,
  extra: Partial<CompletedSession> = {},
): CompletedSession => ({
  mode: "focus",
  endedAt,
  durationMs: 25 * MIN,
  ...extra,
});
/** d일마다 집중 한 번씩 */
const statsOn = (...days: number[]) =>
  getDayStats(days.map((d) => focus(at(d, 10))));

describe("연속 일수", () => {
  it("오늘까지 이어진 날 수와 최고 기록", () => {
    const s = getStreak(statsOn(1, 2, 3, 5, 6, 7, 8), day(8));
    expect(s).toEqual({ current: 4, best: 4, todayDone: true });
  });

  it("오늘 아직 안 했으면 어제까지 이어진 값", () => {
    const s = getStreak(statsOn(5, 6, 7), day(8));
    expect(s).toEqual({ current: 3, best: 3, todayDone: false });
  });

  it("어제도 안 했으면 0, 최고 기록은 남음", () => {
    const s = getStreak(statsOn(1, 2, 3, 4, 6), day(8));
    expect(s).toEqual({ current: 0, best: 4, todayDone: false });
  });

  it("자정 직전·직후 집중은 서로 다른 날로 셈", () => {
    const stats = getDayStats([focus(at(7, 23, 59)), focus(at(8, 0, 1))]);
    expect(getStreak(stats, day(8)).current).toBe(2);
  });

  it("휴식만 한 날은 세지 않음", () => {
    const stats = getDayStats([
      focus(at(7, 10)),
      { mode: "short-break", endedAt: at(8, 10), durationMs: 5 * MIN },
    ]);
    expect(getStreak(stats, day(8))).toMatchObject({
      current: 1,
      todayDone: false,
    });
  });

  it("기록이 없으면 모두 0", () => {
    expect(getStreak(new Map(), day(8))).toEqual({
      current: 0,
      best: 0,
      todayDone: false,
    });
  });
});

describe("최근 n일", () => {
  const stats = getDayStats([
    focus(at(1, 9), { cycleCompleted: true }),
    focus(at(3, 9)),
    focus(at(8, 9), { durationMs: 50 * MIN }),
    focus(at(10, 9)),
  ]);

  it("최근 7일과 그 전 7일 (요일과 상관없이)", () => {
    const week = getRecentComparison(stats, day(10), 7); // 4~10일 / 그 전 10월 28일~11월 3일
    expect(week.recent.focusMs).toBe(75 * MIN); // 8일 50분 + 10일 25분
    expect(week.previous.focusMs).toBe(50 * MIN); // 1일 + 3일
  });

  it("최근 n일: 오래된 날부터 오늘까지, 없는 날은 0", () => {
    const days = getRecentDays(stats, day(10), 3);
    expect(
      days.map((d) => [new Date(d.day).getDate(), d.focusMs / MIN]),
    ).toEqual([
      [8, 50],
      [9, 0],
      [10, 25],
    ]);
  });
});
