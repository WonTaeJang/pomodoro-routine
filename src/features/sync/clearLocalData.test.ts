import { beforeEach, describe, expect, it, vi } from "vitest";

// localStorage를 메모리로 흉내 냄. store를 불러오기 전에 있어야 함
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
import { useTimerStore } from "@/features/timer/store";
import { STORAGE_KEYS } from "@/lib/storage";
import { clearLocalAccountData } from "./clearLocalData";

describe("로그아웃할 때 지우기", () => {
  beforeEach(() => {
    localStorage.clear();
    useTasksStore.getState().clearAll();
    useHistoryStore.getState().clear();
    useTimerStore.getState().resetSettings();
    useTimerStore.getState().resetTimer();
  });

  it("할 일·기록·타이머·맞추기 기억은 지우고, 설정과 다른 저장 값은 남김", () => {
    useTasksStore.getState().add("보고서", 2);
    useHistoryStore
      .getState()
      .addSessions([{ mode: "focus", endedAt: 1, durationMs: 1000 }]);
    useTimerStore.getState().updateSettings({ focusMinutes: 50 });
    useTimerStore.getState().start();
    localStorage.setItem(STORAGE_KEYS.accountSync, "{}");
    localStorage.setItem(STORAGE_KEYS.pet, "pet");
    localStorage.setItem(STORAGE_KEYS.theme, "dark");

    clearLocalAccountData();

    expect(useTasksStore.getState().tasks).toEqual([]);
    expect(useTasksStore.getState().activeTaskId).toBeNull();
    expect(useHistoryStore.getState().sessions).toEqual([]);
    const { timer, settings } = useTimerStore.getState();
    expect(timer.status).toBe("idle");
    expect(settings.focusMinutes).toBe(50);
    expect(localStorage.getItem(STORAGE_KEYS.accountSync)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.pet)).toBe("pet");
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe("dark");
  });
});
