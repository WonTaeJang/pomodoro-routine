import { describe, expect, it } from "vitest";
import type { Task } from "@/features/tasks/types";
import type { CompletedSession } from "@/features/timer/types";
import { focusSessions, getDayStats, taskTitleOf } from "./sessions";

const MIN = 60_000;
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
const shortBreak = (endedAt: number): CompletedSession => ({
  mode: "short-break",
  endedAt,
  durationMs: 5 * MIN,
});

describe("집중 세션", () => {
  it("휴식은 빼고 끝난 순서대로", () => {
    const sessions = [focus(at(7, 10)), shortBreak(at(7, 9)), focus(at(7, 9))];
    expect(focusSessions(sessions).map((s) => s.endedAt)).toEqual([
      at(7, 9),
      at(7, 10),
    ]);
  });

  it("할 일 제목: 기록에 남은 제목 → 없으면 지금 할 일 제목", () => {
    const tasks = [{ id: "a", title: "지금 제목" } as Task];
    const titleOf = taskTitleOf(tasks);
    expect(titleOf(focus(0, { taskId: "a", taskTitle: "그때 제목" }))).toBe(
      "그때 제목",
    );
    expect(titleOf(focus(0, { taskId: "a" }))).toBe("지금 제목");
    expect(titleOf(focus(0, { taskId: "gone" }))).toBeUndefined();
    expect(titleOf(focus(0))).toBeUndefined();
  });
});

describe("날짜별 요약", () => {
  it("그날 끝난 집중 횟수와 시간, 마친 사이클 번호 (날짜를 넘어 이어 셈)", () => {
    const stats = getDayStats([
      focus(at(7, 23, 50), { cycleCompleted: true }),
      focus(at(8, 9, 25)),
      shortBreak(at(8, 9, 30)),
      focus(at(8, 10), { durationMs: 50 * MIN, cycleCompleted: true }),
      focus(at(8, 11), { cycleCompleted: true }),
    ]);
    expect(stats.get(day(7))).toEqual({
      focusCount: 1,
      focusMs: 25 * MIN,
      cycleNumbers: [1],
    });
    expect(stats.get(day(8))).toEqual({
      focusCount: 3,
      focusMs: 100 * MIN,
      cycleNumbers: [2, 3],
    });
    expect(stats.has(day(9))).toBe(false);
  });
});
