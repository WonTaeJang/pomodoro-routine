import type { Task } from "@/features/tasks/types";
import type { CompletedSession } from "@/features/timer/types";
import { startOfDay } from "@/lib/date";

/** 집중 세션만, 끝난 순서대로 */
export function focusSessions(
  sessions: CompletedSession[],
): CompletedSession[] {
  return sessions
    .filter((s) => s.mode === "focus")
    .sort((a, b) => a.endedAt - b.endedAt);
}

/**
 * 집중 세션의 할 일 제목을 찾는 함수를 만듭니다.
 * 기록에 남긴 제목을 먼저 쓰고, 예전 기록(제목 없음)은 지금 남아 있는 할 일에서 찾습니다.
 */
export function taskTitleOf(
  tasks: Task[],
): (session: CompletedSession) => string | undefined {
  const titleById = new Map(tasks.map((t) => [t.id, t.title]));
  return (session) =>
    session.taskTitle ??
    (session.taskId ? titleById.get(session.taskId) : undefined);
}

/** 하루 기록 요약 (헤더의 오늘 기록, 달력 칸, 날짜 상세) */
export type DayStats = {
  /** 마친 집중 횟수 */
  focusCount: number;
  /** 집중한 시간 합계 */
  focusMs: number;
  /** 그날 마친 사이클의 번호들 (제 N호) */
  cycleNumbers: number[];
};

/** 기록이 없는 날 */
export const EMPTY_DAY: DayStats = {
  focusCount: 0,
  focusMs: 0,
  cycleNumbers: [],
};

/** 날짜(그날 시작 시각)별 기록 요약. 기록이 없는 날은 들어 있지 않습니다. */
export function getDayStats(
  sessions: CompletedSession[],
): Map<number, DayStats> {
  const stats = new Map<number, DayStats>();
  let cycleNumber = 0;
  for (const s of focusSessions(sessions)) {
    const day = startOfDay(s.endedAt);
    const entry = stats.get(day) ?? { ...EMPTY_DAY, cycleNumbers: [] };
    entry.focusCount += 1;
    entry.focusMs += s.durationMs;
    if (s.cycleCompleted) entry.cycleNumbers.push(++cycleNumber);
    stats.set(day, entry);
  }
  return stats;
}
