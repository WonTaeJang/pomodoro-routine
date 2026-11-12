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

function byOrder(a: Task, b: Task): number {
  return a.order - b.order;
}

/** 목록에 보이는 할 일 ("완료한 할 일 정리"로 숨긴 것 제외) */
export function visibleTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.archivedAt === null);
}

/** 완료하지 않은 할 일 중 목록에서 가장 위에 있는 것 (except는 제외) */
function firstOpenTaskId(tasks: Task[], except?: string): string | null {
  return (
    [...tasks].sort(byOrder).find((t) => !t.done && t.id !== except)?.id ?? null
  );
}

function nextOrder(tasks: Task[]): number {
  return tasks.reduce((max, t) => Math.max(max, t.order), -1) + 1;
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
    order: nextOrder(state.tasks),
    createdAt: input.now,
    completedAt: null,
    archivedAt: null,
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

/**
 * 완료 체크를 바꿉니다. 완료하면 완료 시각을 기록하고, 취소하면 지웁니다.
 * 완료를 취소하면 목록에서 숨겼던 할 일도 다시 보입니다.
 * 집중 중인 할 일을 완료하면 다음 할 일을 선택합니다.
 */
export function toggleDone(
  state: TasksState,
  id: string,
  now: number,
): TasksState {
  const target = state.tasks.find((t) => t.id === id);
  if (!target) return state;
  const done = !target.done;
  const completedAt = done ? now : null;
  const tasks = state.tasks.map((t) =>
    t.id === id
      ? { ...t, done, completedAt, archivedAt: done ? t.archivedAt : null }
      : t,
  );

  let activeTaskId = state.activeTaskId;
  if (done && activeTaskId === id) activeTaskId = firstOpenTaskId(tasks, id);
  if (!done && activeTaskId === null) activeTaskId = id;
  return { tasks, activeTaskId };
}

/**
 * 할 일 목록을 통째로 바꿉니다. (계정에서 받은 변경을 반영할 때)
 * 지금 집중할 할 일이 없어졌거나 완료됐으면 남은 할 일 중 첫 번째로 (고르지 않은 상태면 그대로)
 */
export function replaceTasks(state: TasksState, tasks: Task[]): TasksState {
  if (state.activeTaskId === null) return { tasks, activeTaskId: null };
  const active = tasks.find((t) => t.id === state.activeTaskId);
  const activeTaskId =
    active && !active.done ? active.id : firstOpenTaskId(tasks);
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

/**
 * 완료한 할 일을 목록에서 한꺼번에 숨깁니다. (완료한 할 일 정리)
 * 지우지 않고 보관해서 캘린더에서는 계속 보입니다.
 */
export function archiveDone(state: TasksState, now: number): TasksState {
  if (!state.tasks.some((t) => t.done && t.archivedAt === null)) return state;
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.done && t.archivedAt === null ? { ...t, archivedAt: now } : t,
    ),
  };
}

/** 화면 표시 순서: 할 일(순서대로) → 완료한 할 일(순서대로) */
export function sortForDisplay(tasks: Task[]): Task[] {
  const sorted = [...tasks].sort(byOrder);
  return [...sorted.filter((t) => !t.done), ...sorted.filter((t) => t.done)];
}

/**
 * 할 일(id)을 다른 할 일(toId)이 있던 자리로 옮깁니다. (끌어서 옮기기)
 * 같은 묶음(할 일 / 완료한 할 일) 안에서만 움직이고, 묶음이 쓰던 순서 번호를
 * 그대로 나눠 가져서 다른 묶음의 순서는 바뀌지 않습니다.
 */
export function moveTask(
  state: TasksState,
  id: string,
  toId: string,
): TasksState {
  const target = state.tasks.find((t) => t.id === id);
  const destination = state.tasks.find((t) => t.id === toId);
  if (!target || !destination || id === toId) return state;
  if (target.archivedAt !== null || destination.archivedAt !== null) {
    return state;
  }
  if (target.done !== destination.done) return state;

  const group = visibleTasks(state.tasks)
    .sort(byOrder)
    .filter((t) => t.done === target.done);
  const moved = group.filter((t) => t.id !== id);
  moved.splice(
    group.findIndex((t) => t.id === toId),
    0,
    target,
  );
  const orders = new Map(moved.map((t, i) => [t.id, group[i].order]));
  return {
    ...state,
    tasks: state.tasks.map((t) => {
      const order = orders.get(t.id);
      return order === undefined ? t : { ...t, order };
    }),
  };
}

/** 예전 형식(순서, 완료일, 숨김 없음)으로 저장된 할 일을 새 형식으로 바꿉니다. */
export function migrateTasks(tasks: Partial<Task>[]): Task[] {
  return tasks.map((t, index) => ({
    ...(t as Task),
    order: t.order ?? index,
    completedAt: t.completedAt ?? null,
    archivedAt: t.archivedAt ?? null,
  }));
}
