import {
  sumDays,
  type DayStats,
  type Totals,
} from "@/features/history/sessions";
import { addDays } from "@/lib/date";

/**
 * 통계 계산을 담은 순수 함수 모음.
 * 날짜별 기록 요약(getDayStats 결과)과 오늘(그날 시작 시각)을 받아 계산합니다.
 */

type Stats = Map<number, DayStats>;

/** 집중을 1번 이상 마친 날인지 */
const focused = (stats: Stats, day: number) =>
  (stats.get(day)?.focusCount ?? 0) > 0;

export type Streak = {
  /** 지금 이어지고 있는 연속 일수. 오늘 아직 집중하지 않았으면 어제까지 센 값 */
  current: number;
  /** 가장 길었던 연속 일수 */
  best: number;
  /** 오늘 집중을 1번 이상 마쳤는지 (아니면 "오늘 집중하면 N일째"로 안내) */
  todayDone: boolean;
};

/** 연속 일수: 하루에 집중을 1번 이상 마치면 그날을 셈 */
export function getStreak(stats: Stats, today: number): Streak {
  const todayDone = focused(stats, today);
  let current = 0;
  for (
    let day = todayDone ? today : addDays(today, -1);
    focused(stats, day);
    day = addDays(day, -1)
  ) {
    current++;
  }

  let best = 0;
  const days = [...stats.keys()]
    .filter((d) => focused(stats, d))
    .sort((a, b) => a - b);
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && addDays(days[i - 1], 1) === days[i] ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return { current, best, todayDone };
}

export type RecentComparison = {
  /** 최근 n일 (오늘 포함) */
  recent: Totals;
  /** 그 전 n일 */
  previous: Totals;
};

/** 최근 n일 합계와 그 전 n일 합계 (요일과 상관없이 늘 같은 날 수끼리 비교) */
export function getRecentComparison(
  stats: Stats,
  today: number,
  n: number,
): RecentComparison {
  const tomorrow = addDays(today, 1);
  const from = addDays(tomorrow, -n);
  return {
    recent: sumDays(stats, from, tomorrow),
    previous: sumDays(stats, addDays(from, -n), from),
  };
}

/** 최근 n일 (오래된 날부터, 마지막이 오늘). 기록이 없는 날은 0 */
export function getRecentDays(
  stats: Stats,
  today: number,
  n: number,
): { day: number; focusMs: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const day = addDays(today, i - n + 1);
    return { day, focusMs: stats.get(day)?.focusMs ?? 0 };
  });
}
