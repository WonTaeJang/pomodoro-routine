import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addTask,
  clearDone,
  initialTasksState,
  recordPomodoros,
  removeTask,
  setActiveTask,
  toggleDone,
  updateTask,
} from "./tasks";
import type { TasksState } from "./types";

type TasksStore = TasksState & {
  add: (title: string, estimate: number) => void;
  update: (id: string, patch: { title?: string; estimate?: number }) => void;
  remove: (id: string) => void;
  toggleDone: (id: string) => void;
  setActive: (id: string | null) => void;
  /** 집중을 마친 할 일들에 뽀모도로 추가 (타이머 store가 호출) */
  recordPomodoros: (taskIds: string[]) => void;
  clearDone: () => void;
  reset: () => void;
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
        toggleDone: (id) => apply((s) => toggleDone(s, id)),
        setActive: (id) => apply((s) => setActiveTask(s, id)),
        recordPomodoros: (ids) => apply((s) => recordPomodoros(s, ids)),
        clearDone: () => apply(clearDone),
        reset: () => set(initialTasksState),
      };
    },
    {
      name: "kkamidoro-tasks",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ tasks, activeTaskId }) => ({ tasks, activeTaskId }),
      skipHydration: true,
    },
  ),
);
