"use client";

import { useNow } from "@/lib/useNow";
import { getTodayFocus, useHistoryStore } from "./store";

/** 오늘 기록 (완료한 집중 수, 집중한 분, 완료한 사이클 수). 화면이 뜨기 전에는 null */
export function useTodayFocus() {
  const sessions = useHistoryStore((s) => s.sessions);
  const now = useNow();
  return now === null ? null : getTodayFocus(sessions, now);
}
