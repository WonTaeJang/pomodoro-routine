import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, tabSafeStorage } from "@/lib/storage";
import type { CompletedSession } from "@/features/timer/types";

type HistoryStore = {
  /** 끝까지 마친 세션 기록. 오늘 기록과 v1.5 통계에 사용 */
  sessions: CompletedSession[];
  addSessions: (sessions: CompletedSession[]) => void;
  /** 기록을 모두 지웁니다. (데이터 초기화) */
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
      name: STORAGE_KEYS.history,
      version: 1,
      storage: createJSONStorage(() => tabSafeStorage(localStorage)),
      skipHydration: true,
    },
  ),
);
