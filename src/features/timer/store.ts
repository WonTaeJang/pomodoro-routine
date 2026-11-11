import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, tabSafeStorage } from "@/lib/storage";
import { newSessions } from "@/features/history/sessions";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { isFocusSoundSetting } from "@/features/focus-sound/sounds";
import {
  applySettings,
  beginAutoStart,
  cancelAutoStart,
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
  /** 다른 탭이 끝낸 세션의 완료 팝업을 이 탭에도 띄움 */
  showCompleted: (session: CompletedSession) => void;
  dismissCompleted: () => void;
  /** 완료 팝업이 보이기 시작했을 때 자동 시작 카운트다운을 시작 */
  beginAutoStart: () => void;
  /** 이번 자동 시작을 취소 (다음 세션은 시작 전 상태로) */
  cancelAutoStart: () => void;
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
  /** 설정과 타이머를 처음 상태로 되돌립니다. (지금은 테스트에서만 씀) */
  resetAll: () => void;
};

/** 기본 설정. 개발용 테스트 모드는 주소(?test=)로 켠 것이라 그대로 둡니다. */
function defaultSettings(current: TimerSettings): TimerSettings {
  return {
    ...DEFAULT_SETTINGS,
    testDurationSeconds: current.testDurationSeconds,
  };
}

/** 끝난 집중 세션에 지금 선택된 할 일(id와 제목)을 붙입니다. */
function attachActiveTask(sessions: CompletedSession[]): CompletedSession[] {
  const { tasks, activeTaskId } = useTasksStore.getState();
  const task = tasks.find((t) => t.id === activeTaskId);
  if (!task) return sessions;
  return sessions.map((s) =>
    s.mode === "focus" ? { ...s, taskId: task.id, taskTitle: task.title } : s,
  );
}

/** 다른 탭이 저장한 값을 다시 불러오는 중인지 (reloadTimerFromOtherTab) */
let reloadingFromOtherTab = false;

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
        // 다른 탭이 같은 세션을 먼저 기록했으면 기록과 🐾를 다시 더하지 않음
        const completed = newSessions(
          useHistoryStore.getState().sessions,
          attachActiveTask(synced.completed),
        );
        useHistoryStore.getState().addSessions(completed);
        useTasksStore
          .getState()
          .recordPomodoros(
            completed.flatMap((c) => (c.taskId ? [c.taskId] : [])),
          );
        // 자동 시작 카운트다운이 끝나 다음 세션이 시작됐으면 완료 팝업을 닫음
        const autoStarted =
          timer.status === "idle" && synced.state.status === "running";
        const lastCompleted = autoStarted
          ? null
          : (completed.at(-1) ?? get().lastCompleted);
        set({ timer: action(synced.state, now), lastCompleted });
      }

      return {
        settings: DEFAULT_SETTINGS,
        timer: createInitialState(DEFAULT_SETTINGS),
        lastCompleted: null,
        showCompleted: (session) => set({ lastCompleted: session }),
        dismissCompleted: () => set({ lastCompleted: null }),
        beginAutoStart: () =>
          update((timer, now) => beginAutoStart(timer, now)),
        cancelAutoStart: () => update((timer) => cancelAutoStart(timer)),
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
      storage: createJSONStorage(() => tabSafeStorage(localStorage)),
      // 완료 팝업(lastCompleted)은 저장하지 않음
      partialize: ({ settings, timer }) => ({ settings, timer }),
      // 서버에서 그린 화면과 첫 화면이 같도록, 저장된 값은 화면이 뜬 뒤에 불러옵니다.
      skipHydration: true,
      // 예전에 저장된 설정에 새 항목이 없을 때 기본값으로 채움
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<
          Pick<TimerStore, "settings" | "timer">
        >;
        const timer = saved.timer ?? current.timer;
        const settings = { ...current.settings, ...saved.settings };
        // 지금 앱에 없는 집중 소리(예: 새 버전에서 빠진 소리)면 끔
        if (!isFocusSoundSetting(settings.focusSound)) {
          settings.focusSound = "off";
        }
        return {
          ...current,
          settings,
          // 팝업을 아직 못 본 자동 시작 대기는 처음 불러올 때(새로고침) 버림. 완료 팝업이 없어서 시작할 방법이 없음.
          // 다른 탭이 저장한 것을 다시 불러올 때는 그대로 (그 탭과 이 탭의 완료 팝업이 함께 기다림)
          timer:
            timer.autoStart?.at === null && !reloadingFromOtherTab
              ? { ...timer, autoStart: null }
              : timer,
        };
      },
    },
  ),
);

/**
 * 다른 탭이 저장한 타이머와 설정을 다시 불러옵니다. 그 탭의 자동 시작 대기도 그대로 가져옵니다.
 * localStorage는 바로 읽히므로 merge까지 이 함수 안에서 끝납니다.
 */
export function reloadTimerFromOtherTab() {
  reloadingFromOtherTab = true;
  try {
    void useTimerStore.persist.rehydrate();
  } finally {
    reloadingFromOtherTab = false;
  }
}
