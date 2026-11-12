import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 저장소(localStorage)를 쓰는 동작만 확인하므로 메모리로 흉내 냄. store를 불러오기 전에 있어야 함
vi.hoisted(() => {
  const data = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, String(value)),
    removeItem: (key) => void data.delete(key),
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
});

import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { STORAGE_KEYS } from "@/lib/storage";
import { reloadTimerFromOtherTab, useTimerStore } from "./store";

const T0 = new Date(2026, 10, 8, 9).getTime();
const MIN = 60_000;

/** 다른 탭이 저장한 것처럼 저장소의 타이머를 바꿈 */
function saveTimerFromOtherTab(patch: object) {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.timer)!);
  saved.state.timer = { ...saved.state.timer, ...patch };
  localStorage.setItem(STORAGE_KEYS.timer, JSON.stringify(saved));
}

describe("다른 탭과 함께 쓰기", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: T0 });
    localStorage.clear();
    useTimerStore.getState().resetSettings();
    useTimerStore.getState().resetTimer();
    useTimerStore.getState().dismissCompleted();
    useHistoryStore.getState().clear();
    useTasksStore.getState().clearAll();
  });
  afterEach(() => vi.useRealTimers());

  it("팝업을 아직 못 본 자동 시작 대기: 새로고침하면 버리고, 다른 탭에서 불러오면 그대로", async () => {
    saveTimerFromOtherTab({ autoStart: { at: null } });

    await useTimerStore.persist.rehydrate(); // 새로고침
    expect(useTimerStore.getState().timer.autoStart).toBeNull();

    reloadTimerFromOtherTab();
    expect(useTimerStore.getState().timer.autoStart).toEqual({ at: null });
  });

  it("다른 탭이 이미 기록한 세션을 이 탭이 다시 끝내도 기록과 🐾는 한 번만", () => {
    useTasksStore.getState().add("공부", 2);
    const task = useTasksStore.getState().tasks[0];
    useTasksStore.getState().setActive(task.id);
    useTimerStore.getState().start();

    // 다른 탭이 먼저 끝내서 기록과 🐾를 저장했고, 이 탭은 그것만 받은 상태
    vi.setSystemTime(T0 + 25 * MIN);
    useHistoryStore
      .getState()
      .addSessions([
        { mode: "focus", endedAt: T0 + 25 * MIN, durationMs: 25 * MIN },
      ]);
    useTasksStore.getState().recordPomodoros([task.id]);

    useTimerStore.getState().sync(); // 이 탭도 같은 세션을 끝냄
    expect(useHistoryStore.getState().sessions).toHaveLength(1);
    expect(useTasksStore.getState().tasks[0].completedPomodoros).toBe(1);
    expect(useTimerStore.getState().timer.mode).toBe("short-break");
  });

  it("완료 팝업만 바뀌면 저장하지 않아서, 다른 탭이 방금 저장한 새 값을 덮어쓰지 않는다", () => {
    useTimerStore.getState().start();
    // 다른 탭이 휴식을 시작해서 저장함 (이 탭은 아직 그 값을 받지 못함)
    saveTimerFromOtherTab({ mode: "short-break", status: "running" });
    const saved = localStorage.getItem(STORAGE_KEYS.timer);

    useTimerStore.getState().showCompleted({
      mode: "focus",
      endedAt: T0,
      durationMs: 25 * MIN,
    });
    useTimerStore.getState().dismissCompleted();
    expect(localStorage.getItem(STORAGE_KEYS.timer)).toBe(saved);

    // 이 탭에서 실제로 바꾸면 저장함
    useTimerStore.getState().pause();
    expect(localStorage.getItem(STORAGE_KEYS.timer)).not.toBe(saved);
  });
});
