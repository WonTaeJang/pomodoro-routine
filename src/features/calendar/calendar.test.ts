import { describe, expect, it } from "vitest";
import type { Task } from "@/features/tasks/types";
import type { CompletedSession } from "@/features/timer/types";
import {
  getDayTasks,
  getFocusLevel,
  getMonthWeeks,
  monthBounds,
  monthOf,
  shiftMonth,
} from "./calendar";

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

const task = (
  id: string,
  title: string,
  completedAt: number | null = null,
): Task => ({
  id,
  title,
  estimate: 4,
  completedPomodoros: 0,
  done: completedAt !== null,
  order: 0,
  createdAt: 0,
  completedAt,
  archivedAt: null,
});

describe("달력 칸", () => {
  it("일요일부터 시작해 그 달을 다 덮는 주", () => {
    const nov = getMonthWeeks(2026, 10); // 11월 1일이 일요일, 30일
    expect(nov).toHaveLength(5);
    expect(nov[0][0]).toBe(day(1));
    expect(new Date(nov[4][6]).getDate()).toBe(5); // 12월 5일까지

    const aug = getMonthWeeks(2026, 7); // 8월 1일이 토요일 → 6주
    expect(aug).toHaveLength(6);
    expect(new Date(aug[0][0]).getDate()).toBe(26); // 7월 26일부터
    expect(getMonthWeeks(2026, 1)).toHaveLength(4); // 2026년 2월은 딱 4주
  });

  it("그날이 있는 달, 앞뒤 달 (해가 바뀌어도)", () => {
    expect(monthOf(at(8, 15))).toEqual({ year: 2026, month: 10 });
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({
      year: 2027,
      month: 0,
    });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({
      year: 2025,
      month: 11,
    });
  });

  it("집중 횟수에 따라 색 단계", () => {
    expect([0, 1, 2, 3, 4, 5, 7, 8, 20].map(getFocusLevel)).toEqual([
      0, 1, 1, 2, 2, 3, 3, 4, 4,
    ]);
  });
});

describe("달 범위", () => {
  it("그 달 첫날부터 다음 달 첫날 전까지 (해가 바뀌어도)", () => {
    expect(monthBounds({ year: 2026, month: 10 })).toEqual({
      from: day(1),
      to: new Date(2026, 11, 1).getTime(),
    });
    expect(monthBounds({ year: 2026, month: 11 }).to).toBe(
      new Date(2027, 0, 1).getTime(),
    );
  });
});

describe("그날의 할 일", () => {
  const tasks = [
    task("a", "영어 단어", at(8, 15)), // 8일에 완료
    task("b", "알고리즘", at(9, 10)), // 9일에 완료
    task("c", "운동"), // 아직 진행 중
    task("d", "청소", at(8, 20)), // 집중 없이 8일에 완료
  ];
  const sessions = [
    focus(at(8, 9), { taskId: "b", taskTitle: "알고리즘" }),
    focus(at(8, 10), { taskId: "a", taskTitle: "영어 단어" }),
    focus(at(8, 11), { taskId: "a", taskTitle: "영어 단어" }),
    focus(at(8, 12), { taskId: "gone", taskTitle: "지운 할 일" }),
    focus(at(8, 13), { taskId: "c" }), // 예전 기록: 제목 없음
    focus(at(8, 14)), // 할 일 없이 집중
    focus(at(9, 9), { taskId: "b", taskTitle: "알고리즘" }),
  ];

  it("그날 완료한 할 일 (집중 없이 완료한 것도)", () => {
    expect(getDayTasks(sessions, tasks, day(8)).completed).toEqual([
      { id: "a", title: "영어 단어", pomodoros: 2 },
      { id: "d", title: "청소", pomodoros: 0 },
    ]);
  });

  it("진행 중: 그날 집중했지만 그날 안에 끝내지 못한 할 일 (나중에 끝냈어도), 지운 할 일은 남은 제목으로", () => {
    expect(getDayTasks(sessions, tasks, day(8)).inProgress).toEqual([
      { id: "b", title: "알고리즘", pomodoros: 1 },
      { id: null, title: "지운 할 일", pomodoros: 1 },
      { id: "c", title: "운동", pomodoros: 1 },
    ]);
  });

  it("다음 날: 그날 끝낸 할 일은 완료로만", () => {
    const detail = getDayTasks(sessions, tasks, day(9));
    expect(detail.completed).toEqual([
      { id: "b", title: "알고리즘", pomodoros: 1 },
    ]);
    expect(detail.inProgress).toEqual([]);
  });

  it("기록이 없는 날", () => {
    expect(getDayTasks(sessions, tasks, day(1))).toEqual({
      completed: [],
      inProgress: [],
    });
  });
});
