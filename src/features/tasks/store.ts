import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, tabSafeStorage } from "@/lib/storage";
import {
  addTask,
  archiveDone,
  initialTasksState,
  recordPomodoros,
  removeTask,
  replaceTasks,
  migrateTasks,
  moveTask,
  setActiveTask,
  toggleDone,
  updateTask,
} from "./tasks";
import type { Task, TasksState } from "./types";

type TasksStore = TasksState & {
  add: (title: string, estimate: number) => void;
  update: (id: string, patch: { title?: string; estimate?: number }) => void;
  remove: (id: string) => void;
  toggleDone: (id: string) => void;
  /** 할 일을 다른 할 일이 있던 자리로 옮깁니다. (같은 묶음 안에서만) */
  move: (id: string, toId: string) => void;
  setActive: (id: string | null) => void;
  /** 집중을 마친 할 일들에 뽀모도로 추가 (타이머 store가 호출) */
  recordPomodoros: (taskIds: string[]) => void;
  /** 완료한 할 일을 목록에서 숨깁니다. (캘린더에는 남음) */
  archiveDone: () => void;
  /**
   * 할 일 목록을 통째로 바꿉니다. (계정에서 받은 변경을 반영할 때)
   * 지금 집중할 할 일이 없어졌거나 완료됐으면 다른 할 일로 바꿈 (tasks.ts의 replaceTasks)
   */
  replaceTasks: (tasks: Task[]) => void;
  /** 할 일을 모두 지웁니다. (로그아웃할 때, src/features/sync/clearLocalData.ts) */
  clearAll: () => void;
};

export const useTasksStore = create<TasksStore>()(
  persist(
    (set) => {
      const apply = (fn: (state: TasksState) => TasksState) =>
        set((s) => fn({ tasks: s.tasks, activeTaskId: s.activeTaskId }));

      return {
        ...initialTasksState,
        add: (title, estimate) =>
          apply((s) =>
            addTask(s, {
              id: crypto.randomUUID(),
              title,
              estimate,
              now: Date.now(),
            }),
          ),
        update: (id, patch) => apply((s) => updateTask(s, id, patch)),
        remove: (id) => apply((s) => removeTask(s, id)),
        toggleDone: (id) => apply((s) => toggleDone(s, id, Date.now())),
        move: (id, toId) => apply((s) => moveTask(s, id, toId)),
        setActive: (id) => apply((s) => setActiveTask(s, id)),
        recordPomodoros: (ids) => apply((s) => recordPomodoros(s, ids)),
        archiveDone: () => apply((s) => archiveDone(s, Date.now())),
        replaceTasks: (tasks) => apply((s) => replaceTasks(s, tasks)),
        clearAll: () => apply(() => initialTasksState),
      };
    },
    {
      name: STORAGE_KEYS.tasks,
      // v2: 할 일에 순서(order), 완료 시각(completedAt) 추가
      // v3: 목록에서 숨긴 시각(archivedAt) 추가
      version: 3,
      migrate: (persisted) => {
        const saved = (persisted ?? {}) as Partial<TasksState>;
        return {
          tasks: migrateTasks(saved.tasks ?? []),
          activeTaskId: saved.activeTaskId ?? null,
        };
      },
      storage: createJSONStorage(() => tabSafeStorage(localStorage)),
      partialize: ({ tasks, activeTaskId }) => ({ tasks, activeTaskId }),
      skipHydration: true,
    },
  ),
);
