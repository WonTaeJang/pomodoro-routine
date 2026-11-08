"use client";

import { useMemo } from "react";
import { useToday } from "@/lib/useNow";
import { EMPTY_DAY, getDayStats, type DayStats } from "./sessions";
import { useHistoryStore } from "./store";

/** 오늘 기록 (집중 횟수, 집중한 시간, 마친 사이클). 화면이 뜨기 전에는 null */
export function useTodayFocus(): DayStats | null {
  const sessions = useHistoryStore((s) => s.sessions);
  const today = useToday();
  const stats = useMemo(() => getDayStats(sessions), [sessions]);
  return today === null ? null : (stats.get(today) ?? EMPTY_DAY);
}
