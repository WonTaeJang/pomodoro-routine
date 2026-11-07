import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CompletedSession } from "@/features/timer/types";

type HistoryStore = {
  /** 끝까지 마친 세션 기록. 오늘 기록과 v1.5 통계에 사용 */
  sessions: CompletedSession[];
  addSessions: (sessions: CompletedSession[]) => void;
  clear: () => void;
};

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      sessions: [],
      addSessions: (sessions) => {
        if (sessions.length === 0) return;
        set((s) => ({ sessions: [...s.sessions, ...sessions] }));
      },
      clear: () => set({ sessions: [] }),
    }),
    {
      name: "kkamidoro-history",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/** 하루의 시작 시각(로컬 자정) */
function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** 오늘 완료한 집중 세션 수와 집중한 분 */
export function getTodayFocus(sessions: CompletedSession[], now: number) {
  const from = startOfDay(now);
  const focus = sessions.filter((s) => s.mode === "focus" && s.endedAt >= from);
  const minutes = Math.round(
    focus.reduce((sum, s) => sum + s.durationMs, 0) / 60_000,
  );
  return { count: focus.length, minutes };
}
