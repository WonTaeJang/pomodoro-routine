import type { Task, TasksState } from "./types";

/**
 * 할 일 규칙을 담은 순수 함수 모음. 상태를 받아 새 상태를 돌려줍니다.
 */

export const TITLE_MAX_LENGTH = 100;
export const ESTIMATE_MIN = 1;
export const ESTIMATE_MAX = 20;

export const initialTasksState: TasksState = { tasks: [], activeTaskId: null };

function clampEstimate(value: number): number {
  if (!Number.isFinite(value)) return ESTIMATE_MIN;
  return Math.min(ESTIMATE_MAX, Math.max(ESTIMATE_MIN, Math.round(value)));
}

function cleanTitle(title: string): string {
  return title.trim().slice(0, TITLE_MAX_LENGTH);
}

/** 완료하지 않은 할 일 중 첫 번째 (except는 제외) */
function firstOpenTaskId(tasks: Task[], except?: string): string | null {
  return tasks.find((t) => !t.done && t.id !== except)?.id ?? null;
}

/** 할 일을 추가합니다. 집중할 할 일이 없으면 새 할 일을 선택합니다. */
export function addTask(
  state: TasksState,
  input: { id: string; title: string; estimate: number; now: number },
): TasksState {
  const title = cleanTitle(input.title);
  if (!title) return state;
  const task: Task = {
    id: input.id,
    title,
    estimate: clampEstimate(input.estimate),
    completedPomodoros: 0,
    done: false,
    createdAt: input.now,
  };
  return {
    tasks: [...state.tasks, task],
    activeTaskId: state.activeTaskId ?? task.id,
  };
}

export function updateTask(
  state: TasksState,
  id: string,
  patch: { title?: string; estimate?: number },
): TasksState {
  const title = patch.title === undefined ? undefined : cleanTitle(patch.title);
  if (title === "") return state;
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            ...(title !== undefined && { title }),
            ...(patch.estimate !== undefined && {
              estimate: clampEstimate(patch.estimate),
            }),
          }
        : t,
    ),
  };
}

/** 삭제합니다. 집중 중인 할 일이었다면 다음 할 일을 선택합니다. */
export function removeTask(state: TasksState, id: string): TasksState {
  const tasks = state.tasks.filter((t) => t.id !== id);
  const activeTaskId =
    state.activeTaskId === id ? firstOpenTaskId(tasks) : state.activeTaskId;
  return { tasks, activeTaskId };
}

/** 완료 체크를 바꿉니다. 집중 중인 할 일을 완료하면 다음 할 일을 선택합니다. */
export function toggleDone(state: TasksState, id: string): TasksState {
  const target = state.tasks.find((t) => t.id === id);
  if (!target) return state;
  const done = !target.done;
  const tasks = state.tasks.map((t) => (t.id === id ? { ...t, done } : t));

  let activeTaskId = state.activeTaskId;
  if (done && activeTaskId === id) activeTaskId = firstOpenTaskId(tasks, id);
  if (!done && activeTaskId === null) activeTaskId = id;
  return { tasks, activeTaskId };
}

/** 집중할 할 일을 고릅니다. 없거나 완료한 할 일은 고를 수 없습니다. */
export function setActiveTask(
  state: TasksState,
  id: string | null,
): TasksState {
  if (id === null) return { ...state, activeTaskId: null };
  const task = state.tasks.find((t) => t.id === id);
  if (!task || task.done) return state;
  return { ...state, activeTaskId: id };
}

/** 집중을 마친 할 일에 뽀모도로를 더합니다. */
export function recordPomodoros(
  state: TasksState,
  taskIds: string[],
): TasksState {
  if (taskIds.length === 0) return state;
  return {
    ...state,
    tasks: state.tasks.map((t) => {
      const count = taskIds.filter((id) => id === t.id).length;
      return count
        ? { ...t, completedPomodoros: t.completedPomodoros + count }
        : t;
    }),
  };
}

/** 완료한 할 일을 한꺼번에 지웁니다. */
export function clearDone(state: TasksState): TasksState {
  const tasks = state.tasks.filter((t) => !t.done);
  const activeTaskId = tasks.some((t) => t.id === state.activeTaskId)
    ? state.activeTaskId
    : firstOpenTaskId(tasks);
  return { tasks, activeTaskId };
}

/** 화면 표시 순서: 할 일(추가한 순서) → 완료한 할 일 */
export function sortForDisplay(tasks: Task[]): Task[] {
  return [...tasks.filter((t) => !t.done), ...tasks.filter((t) => t.done)];
}
