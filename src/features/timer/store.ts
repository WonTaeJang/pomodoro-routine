import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/storage";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import {
  applySettings,
  createInitialState,
  DEFAULT_SETTINGS,
  pause,
  reset,
  skip,
  start,
  switchMode,
  sync,
} from "./timer";
import type {
  CompletedSession,
  TimerMode,
  TimerSettings,
  TimerState,
} from "./types";

type TimerStore = {
  settings: TimerSettings;
  timer: TimerState;
  /** 방금 끝난 세션. 완료 팝업을 띄우는 데 사용 (저장하지 않음) */
  lastCompleted: CompletedSession | null;
  dismissCompleted: () => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (mode: TimerMode) => void;
  /** 진행 중인 세션이 끝났는지 확인하고 다음 세션으로 넘깁니다. 시계가 돌 때마다 호출 */
  sync: () => void;
  updateSettings: (patch: Partial<TimerSettings>) => void;
  /** 설정만 기본값으로 되돌립니다. */
  resetSettings: () => void;
  /** 설정과 타이머를 처음 상태로 되돌립니다. (데이터 초기화) */
  resetAll: () => void;
};

/** 기본 설정. 개발용 테스트 모드는 주소(?test=)로 켠 것이라 그대로 둡니다. */
function defaultSettings(current: TimerSettings): TimerSettings {
  return {
    ...DEFAULT_SETTINGS,
    testDurationSeconds: current.testDurationSeconds,
  };
}

/** 끝난 집중 세션에 지금 선택된 할 일을 붙입니다. */
function attachActiveTask(sessions: CompletedSession[]): CompletedSession[] {
  const taskId = useTasksStore.getState().activeTaskId;
  if (!taskId) return sessions;
  return sessions.map((s) => (s.mode === "focus" ? { ...s, taskId } : s));
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => {
      /**
       * 모든 동작은 먼저 끝난 세션을 처리(sync)한 뒤 실행합니다.
       * 예: 이미 시간이 다 된 뒤에 일시정지를 누른 경우, 완료 처리가 먼저 됩니다.
       */
      function update(action: (timer: TimerState, now: number) => TimerState) {
        const now = Date.now();
        const { settings, timer } = get();
        const synced = sync(timer, settings, now);
        const completed = attachActiveTask(synced.completed);
        useHistoryStore.getState().addSessions(completed);
        useTasksStore
          .getState()
          .recordPomodoros(
            completed.flatMap((c) => (c.taskId ? [c.taskId] : [])),
          );
        const lastCompleted = completed.at(-1) ?? get().lastCompleted;
        set({ timer: action(synced.state, now), lastCompleted });
      }

      return {
        settings: DEFAULT_SETTINGS,
        timer: createInitialState(DEFAULT_SETTINGS),
        lastCompleted: null,
        dismissCompleted: () => set({ lastCompleted: null }),
        start: () => update((timer, now) => start(timer, now)),
        pause: () => update((timer, now) => pause(timer, now)),
        reset: () => update((timer) => reset(timer, get().settings)),
        skip: () => update((timer) => skip(timer, get().settings)),
        switchMode: (mode) =>
          update((timer) => switchMode(timer, mode, get().settings)),
        sync: () => update((timer) => timer),
        updateSettings: (patch) => {
          const settings = { ...get().settings, ...patch };
          set({ settings, timer: applySettings(get().timer, settings) });
        },
        resetSettings: () => {
          const settings = defaultSettings(get().settings);
          set({ settings, timer: applySettings(get().timer, settings) });
        },
        resetAll: () => {
          const settings = defaultSettings(get().settings);
          set({
            settings,
            timer: createInitialState(settings),
            lastCompleted: null,
          });
        },
      };
    },
    {
      name: STORAGE_KEYS.timer,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ settings, timer }) => ({ settings, timer }),
      // 서버에서 그린 화면과 첫 화면이 같도록, 저장된 값은 화면이 뜬 뒤에 불러옵니다.
      skipHydration: true,
      // 예전에 저장된 설정에 새 항목이 없을 때 기본값으로 채움
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<
          Pick<TimerStore, "settings" | "timer">
        >;
        return {
          ...current,
          settings: { ...current.settings, ...saved.settings },
          timer: saved.timer ?? current.timer,
        };
      },
    },
  ),
);
