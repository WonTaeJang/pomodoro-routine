import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, tabSafeStorage } from "@/lib/storage";
import type { CompletedSession } from "@/features/timer/types";
import { newSessions } from "./sessions";

type HistoryStore = {
  /** 끝까지 마친 세션 기록. 오늘 기록과 v1.5 통계에 사용 */
  sessions: CompletedSession[];
  addSessions: (sessions: CompletedSession[]) => void;
  /** 계정에서 받아온 기록을 합칩니다. 이미 있는 기록은 빼고, 끝난 순서대로 둡니다. */
  mergeSessions: (sessions: CompletedSession[]) => void;
  /** 기록을 모두 지웁니다. (로그아웃할 때, src/features/sync/clearLocalData.ts) */
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
      mergeSessions: (sessions) =>
        set((s) => {
          const added = newSessions(s.sessions, sessions);
          if (added.length === 0) return s;
          return {
            sessions: [...s.sessions, ...added].sort(
              (a, b) => a.endedAt - b.endedAt,
            ),
          };
        }),
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
