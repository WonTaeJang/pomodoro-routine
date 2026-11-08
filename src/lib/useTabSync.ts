"use client";

import { useEffect } from "react";
import { newSessions } from "@/features/history/sessions";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { applySavedTheme } from "@/features/theme/theme";
import { reloadTimerFromOtherTab, useTimerStore } from "@/features/timer/store";
import { STORAGE_KEYS } from "./storage";

/** 탭끼리 주고받는 알림 (저장하지 않는 것) */
const CHANNEL = "kkamodoro";
type TabMessage = { type: "completed-closed"; endedAt: number };

type PersistedStore = {
  persist: {
    getOptions: () => { name?: string; version?: number };
    rehydrate: () => Promise<void> | void;
  };
};

/**
 * 다른 탭이 저장한 값이 이 탭에서 쓰는 형식보다 새 버전이면 true.
 * 새 버전 앱을 연 탭이 있으면 예전 탭은 그 값을 불러오지 않음 (예전 형식으로 바꿔 덮어쓰지 않게)
 */
function savedByNewerApp(store: PersistedStore): boolean {
  const { name, version = 0 } = store.persist.getOptions();
  if (!name) return false;
  try {
    const saved = JSON.parse(localStorage.getItem(name) ?? "null") as {
      version?: number;
    } | null;
    return (saved?.version ?? 0) > version;
  } catch {
    return false;
  }
}

/** 저장소에서 다시 불러옴. 새 버전 앱이 저장한 값이면 불러오지 않고 false */
function reload(
  store: PersistedStore,
  rehydrate: () => void = () => void store.persist.rehydrate(),
): boolean {
  if (savedByNewerApp(store)) return false;
  rehydrate();
  return true;
}

/** 기록: 다른 탭이 방금 끝낸 세션이 있으면 이 탭에도 완료 팝업. 기록이 지워졌으면 팝업을 닫음 */
function reloadHistory() {
  const before = useHistoryStore.getState().sessions;
  if (!reload(useHistoryStore)) return;
  const after = useHistoryStore.getState().sessions;

  const timer = useTimerStore.getState();
  const latest = before.reduce((max, s) => Math.max(max, s.endedAt), 0);
  const finished = newSessions(before, after).filter((s) => s.endedAt > latest);
  if (finished.length > 0) {
    timer.showCompleted(finished[finished.length - 1]);
  } else if (
    timer.lastCompleted &&
    newSessions(after, [timer.lastCompleted]).length > 0
  ) {
    // 다른 탭에서 기록을 지움 (데이터 초기화)
    timer.dismissCompleted();
  }
}

/** 타이머: 다른 탭이 다음 세션을 시작했으면 이 탭의 완료 팝업도 닫음 */
function reloadTimer() {
  const wasRunning = useTimerStore.getState().timer.status === "running";
  if (!reload(useTimerStore, reloadTimerFromOtherTab)) return;
  const { timer, lastCompleted, dismissCompleted } = useTimerStore.getState();
  if (!wasRunning && timer.status === "running" && lastCompleted) {
    dismissCompleted();
  }
}

/**
 * 같은 브라우저에 열린 다른 탭과 맞춥니다. 앱 틀(AppShell)에서 저장값을 불러온 뒤 한 번만 씁니다.
 * - 다른 탭이 저장하면 할 일, 기록, 타이머, 설정, 테마를 다시 불러옴
 * - 완료 팝업을 한 탭에서 닫으면 다른 탭 팝업도 닫음
 */
export function useTabSync(ready: boolean) {
  useEffect(() => {
    if (!ready) return;

    function onStorage(e: StorageEvent) {
      if (e.storageArea !== localStorage) return;
      const all = e.key === null; // 다른 탭이 저장소를 통째로 비움
      // 기록 → 할 일 → 타이머 순서 (세션을 끝낸 탭이 저장하는 순서와 같게)
      if (all || e.key === STORAGE_KEYS.history) reloadHistory();
      if (all || e.key === STORAGE_KEYS.tasks) reload(useTasksStore);
      if (all || e.key === STORAGE_KEYS.timer) reloadTimer();
      if (all || e.key === STORAGE_KEYS.theme) applySavedTheme();
    }
    window.addEventListener("storage", onStorage);

    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e: MessageEvent<TabMessage>) => {
      const { lastCompleted, dismissCompleted } = useTimerStore.getState();
      if (
        e.data?.type === "completed-closed" &&
        lastCompleted?.endedAt === e.data.endedAt
      ) {
        dismissCompleted();
      }
    };
    const unsubscribe = useTimerStore.subscribe((state, prev) => {
      if (prev.lastCompleted && !state.lastCompleted) {
        const message: TabMessage = {
          type: "completed-closed",
          endedAt: prev.lastCompleted.endedAt,
        };
        channel.postMessage(message);
      }
    });

    return () => {
      window.removeEventListener("storage", onStorage);
      channel.close();
      unsubscribe();
    };
  }, [ready]);
}
