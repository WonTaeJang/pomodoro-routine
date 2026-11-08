import {
  focusSessions,
  taskTitleOf,
  type DayStats,
} from "@/features/history/sessions";
import type { Task } from "@/features/tasks/types";
import type { CompletedSession } from "@/features/timer/types";
import { addDays } from "@/lib/date";

/**
 * 캘린더 계산을 담은 순수 함수 모음. 날짜는 그날 시작 시각(로컬 자정, epoch ms)으로 다룹니다.
 */

/** 달력에 보이는 달 (month는 0~11) */
export type MonthView = { year: number; month: number };

/** 그날이 있는 달 */
export function monthOf(day: number): MonthView {
  const date = new Date(day);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/** n달 뒤(앞이면 음수) */
export function shiftMonth({ year, month }: MonthView, by: number): MonthView {
  return monthOf(new Date(year, month + by, 1).getTime());
}

/** 한 주의 날짜 7개 (일요일부터) */
export type Week = number[];

/** 그 달을 다 덮는 주들. 앞뒤 달의 날짜로 첫 주와 마지막 주를 채웁니다. (month는 0~11) */
export function getMonthWeeks(year: number, month: number): Week[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekCount = Math.ceil((first.getDay() + daysInMonth) / 7);
  const start = addDays(first.getTime(), -first.getDay());
  return Array.from({ length: weekCount }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)),
  );
}

/** 그 달(month는 0~11)의 집중 횟수와 마친 사이클 수 합계 */
export function getMonthTotals(
  stats: Map<number, DayStats>,
  year: number,
  month: number,
): { focusCount: number; cycles: number } {
  let focusCount = 0;
  let cycles = 0;
  for (const [day, s] of stats) {
    const date = new Date(day);
    if (date.getFullYear() !== year || date.getMonth() !== month) continue;
    focusCount += s.focusCount;
    cycles += s.cycleNumbers.length;
  }
  return { focusCount, cycles };
}

/** 집중 횟수에 따른 달력 칸 색 단계 (0: 기록 없음 ~ 4: 가장 진함) */
export const FOCUS_LEVELS = [
  { level: 1, min: 1 },
  { level: 2, min: 3 },
  { level: 3, min: 5 },
  { level: 4, min: 8 },
] as const;

export function getFocusLevel(focusCount: number): number {
  let level = 0;
  for (const step of FOCUS_LEVELS)
    if (focusCount >= step.min) level = step.level;
  return level;
}

/** 날짜 상세에 보이는 할 일 한 줄 */
export type DayTask = {
  /** 할 일 id. 기록만 남고 지운 할 일이면 없을 수 있음 */
  id: string | null;
  title: string;
  /** 그날 이 할 일로 마친 집중 횟수 */
  pomodoros: number;
};

/** 그날의 할 일 */
export type DayTasks = {
  /** 그날 완료한 할 일 (완료한 순서) */
  completed: DayTask[];
  /** 그날 집중했지만 그날까지 끝내지 못한 할 일 (처음 집중한 순서) */
  inProgress: DayTask[];
};

/**
 * 그날 완료한 할 일과 진행 중이던 할 일.
 * 진행 중 = 그날 집중했고, 그날이 끝날 때까지 완료하지 않은 할 일 (나중에 끝냈어도 그날은 진행 중)
 */
export function getDayTasks(
  sessions: CompletedSession[],
  tasks: Task[],
  day: number,
): DayTasks {
  const dayEnd = addDays(day, 1);
  const inDay = (time: number | null) =>
    time !== null && time >= day && time < dayEnd;

  // 그날 집중한 할 일: 처음 집중한 순서대로, 횟수와 제목
  const titleOf = taskTitleOf(tasks);
  const focused = new Map<string, { title: string; pomodoros: number }>();
  for (const s of focusSessions(sessions)) {
    if (!inDay(s.endedAt) || !s.taskId) continue;
    const entry = focused.get(s.taskId);
    if (entry) entry.pomodoros += 1;
    else focused.set(s.taskId, { title: titleOf(s) ?? "", pomodoros: 1 });
  }

  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const completed = tasks
    .filter((t) => inDay(t.completedAt))
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
    .map((t) => ({
      id: t.id,
      title: t.title,
      pomodoros: focused.get(t.id)?.pomodoros ?? 0,
    }));

  const inProgress = [...focused].flatMap(([id, { title, pomodoros }]) => {
    const task = taskById.get(id);
    const doneByThen = task?.completedAt != null && task.completedAt < dayEnd;
    if (doneByThen || !title) return [];
    return [{ id: task ? id : null, title: task?.title ?? title, pomodoros }];
  });

  return { completed, inProgress };
}
