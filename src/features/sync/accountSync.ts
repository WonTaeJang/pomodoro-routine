import type { SupabaseClient } from "@supabase/supabase-js";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { useTimerStore } from "@/features/timer/store";
import {
  fetchSessions,
  fetchSettings,
  fetchTasksSince,
  markTasksDeleted,
  uploadSessions,
  uploadSettings,
  uploadTasks,
} from "./api";
import { readSyncMemory, updateSyncMemory } from "./memory";
import { createSessionSync } from "./sessionSync";
import { pickSyncedSettings, SYNCED_SETTING_KEYS } from "./settingsRows";
import { createSettingsSync } from "./settingsSync";
import { toTaskRow } from "./taskRows";
import { createTaskSync } from "./taskSync";

/** 탭으로 돌아왔을 때 서버를 다시 확인하는 최소 간격 (다른 기기에서 바뀐 것을 가져옴) */
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
/** 할 일·설정을 고친 뒤 올리기까지 기다리는 시간 (연달아 고치면 한 번만 올림) */
const SAVE_DELAY_MS = 800;

/**
 * 한 계정의 집중 기록·할 일·설정을 이 브라우저의 store와 맞추기 시작합니다. 그만두는 함수를 돌려줌.
 * - 시작하면: 서버에서 받아 합치고, 이 브라우저에서 생기거나 바뀐 것을 올림
 * - 기록이 생기면 바로, 할 일·설정을 고치면 잠깐 모았다가 올림
 * - 인터넷이 다시 연결되거나 탭으로 돌아오면 못 올린 것을 다시 올림
 *   (탭으로 돌아오면 5분에 한 번까지 서버에서 다시 받음)
 */
export function startAccountSync(
  supabase: SupabaseClient,
  userId: string,
): () => void {
  const sessions = createSessionSync({
    fetchAll: () => fetchSessions(supabase),
    upload: (list) => uploadSessions(supabase, userId, list),
    getLocal: () => useHistoryStore.getState().sessions,
    mergeLocal: (list) => useHistoryStore.getState().mergeSessions(list),
  });

  const tasks = createTaskSync({
    fetchSince: (since) => fetchTasksSince(supabase, since),
    toRow: (task) => toTaskRow(task, userId),
    upload: (rows) => uploadTasks(supabase, rows),
    markDeleted: (ids) =>
      markTasksDeleted(supabase, ids, new Date().toISOString()),
    getLocal: () => useTasksStore.getState().tasks,
    setLocal: (list) => useTasksStore.getState().replaceTasks(list),
    readMemory: () => readSyncMemory(userId).tasks,
    writeMemory: (memory) => updateSyncMemory(userId, { tasks: memory }),
  });

  const settings = createSettingsSync({
    fetch: () => fetchSettings(supabase),
    upload: (value) => uploadSettings(supabase, userId, value),
    getLocal: () =>
      pickSyncedSettings(
        useTimerStore.getState().settings,
        useTasksStore.getState().activeTaskId,
      ),
    setLocal: ({ activeTaskId, ...value }) => {
      useTimerStore.getState().updateSettings(value);
      useTasksStore.getState().setActive(activeTaskId);
    },
    readMemory: () => readSyncMemory(userId).settings,
    writeMemory: (shape) => updateSyncMemory(userId, { settings: shape }),
  });

  /** 할 일을 먼저 맞춰야 설정의 "지금 집중할 할 일"을 고를 수 있음 */
  const syncAll = async (refresh = false) => {
    void sessions.sync({ refresh });
    await tasks.sync({ refresh });
    await settings.sync({ refresh });
  };

  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const later = (key: string, run: () => void) => {
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(run, SAVE_DELAY_MS));
  };

  let refreshedAt = Date.now();
  void syncAll();

  const unsubscribes = [
    // 기록이 늘면(이 탭이든 다른 탭이든) 바로 올림
    useHistoryStore.subscribe((state, previous) => {
      if (state.sessions !== previous.sessions) void sessions.sync();
    }),
    useTasksStore.subscribe((state, previous) => {
      if (state.tasks !== previous.tasks) {
        later("tasks", () => void tasks.sync());
      }
      if (state.activeTaskId !== previous.activeTaskId) {
        later("settings", () => void settings.sync());
      }
    }),
    useTimerStore.subscribe((state, previous) => {
      const changed = SYNCED_SETTING_KEYS.some(
        (key) => state.settings[key] !== previous.settings[key],
      );
      if (changed) later("settings", () => void settings.sync());
    }),
  ];
  const onOnline = () => void syncAll();
  const onVisible = () => {
    if (document.visibilityState !== "visible") return;
    const refresh = Date.now() - refreshedAt >= REFRESH_INTERVAL_MS;
    if (refresh) refreshedAt = Date.now();
    void syncAll(refresh);
  };
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    // 받는 중이던 응답이 로그아웃 뒤(또는 다른 계정으로 바꾼 뒤)에 반영되지 않게
    sessions.stop();
    tasks.stop();
    settings.stop();
    for (const timer of timers.values()) clearTimeout(timer);
    unsubscribes.forEach((unsubscribe) => unsubscribe());
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
