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

/** 같은 세션인지 가리는 값. 여러 탭이 같은 세션을 함께 끝내도 하나로 봅니다. */
const sessionId = (s: CompletedSession) => `${s.mode}:${s.endedAt}`;

/** incoming 중 existing에 아직 없는 세션 (순서 유지) */
export function newSessions(
  existing: CompletedSession[],
  incoming: CompletedSession[],
): CompletedSession[] {
  const seen = new Set(existing.map(sessionId));
  return incoming.filter((s) => !seen.has(sessionId(s)));
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

/** 여러 날의 합계 */
export type Totals = { focusCount: number; focusMs: number; cycles: number };

/** from 이상 to 미만인 날들의 합계 (날짜는 그날 시작 시각) */
export function sumDays(
  stats: Map<number, DayStats>,
  from: number,
  to: number,
): Totals {
  const totals: Totals = { focusCount: 0, focusMs: 0, cycles: 0 };
  for (const [day, s] of stats) {
    if (day < from || day >= to) continue;
    totals.focusCount += s.focusCount;
    totals.focusMs += s.focusMs;
    totals.cycles += s.cycleNumbers.length;
  }
  return totals;
}
