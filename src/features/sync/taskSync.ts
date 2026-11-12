import type { Task } from "@/features/tasks/types";
import type { TaskMemory } from "./memory";
import { createRunner, type Runner } from "./runner";
import {
  fromTaskRow,
  taskShape,
  type RemoteTaskRow,
  type TaskRow,
} from "./taskRows";

/**
 * 서버 시계는 "고친 시각"을 트랜잭션이 시작할 때 찍어서, 늦게 끝난 저장이 앞선 시각으로 남을 수 있음.
 * 받을 때 마지막으로 받은 시각보다 조금 앞부터 다시 받음 (겹쳐 받은 줄은 이미 같으므로 무해)
 */
const CURSOR_OVERLAP_MS = 60_000;

type TaskSyncDeps = {
  /** since 이후에 고친 내 할 일 (지운 표시 포함). since가 없으면 전부 */
  fetchSince: (since: string | null) => Promise<RemoteTaskRow[]>;
  /** 할 일을 서버 표의 줄로. 표에 넣을 수 없으면 null (그런 할 일은 이 브라우저에만 둠) */
  toRow: (task: Task) => TaskRow | null;
  /** 줄 올리기 (서버에 있으면 덮어씀) */
  upload: (rows: TaskRow[]) => Promise<void>;
  /** 할 일에 지운 표시 */
  markDeleted: (ids: string[]) => Promise<void>;
  /** 이 브라우저의 할 일 */
  getLocal: () => Task[];
  /** 서버에서 받은 변경을 반영한 할 일 목록으로 바꾸기 */
  setLocal: (tasks: Task[]) => void;
  /** 이 계정의 할 일 기억 읽기·쓰기 (탭끼리 같이 쓰므로 맞출 때마다 새로 읽음) */
  readMemory: () => TaskMemory;
  writeMemory: (memory: TaskMemory) => void;
};

/** since에서 겹쳐 받을 만큼 뺀 시각 */
function overlap(cursor: string | null): string | null {
  if (!cursor) return null;
  const at = Date.parse(cursor);
  return Number.isNaN(at)
    ? null
    : new Date(at - CURSOR_OVERLAP_MS).toISOString();
}

/**
 * 한 계정의 할 일 맞추기. sync()는 (처음이거나 refresh면) 서버에서 바뀐 할 일을 받아 반영하고,
 * 이 브라우저에서 바뀐 할 일을 올립니다.
 *
 * "서버와 같다고 확인한 모양"(baseline)과 비교해서
 * - 모양이 달라진 할 일 = 이 브라우저에서 고친 것 → 올림
 * - baseline에는 있는데 목록에 없는 할 일 = 이 브라우저에서 지운 것 → 지운 표시
 * 받은 할 일이 이 브라우저에서도 고친 것이면 이 브라우저 쪽을 남깁니다 (바로 올려서 서버에서도 나중이 됨).
 */
export function createTaskSync(deps: TaskSyncDeps): Runner {
  let pulled = false;

  /** 서버에서 바뀐 할 일을 받아 이 브라우저에서 고치지 않은 것만 반영 */
  async function pull(memory: TaskMemory, isStopped: () => boolean) {
    const rows = await deps.fetchSince(overlap(memory.cursor));
    if (isStopped()) return false;
    const baseline = memory.baseline;
    const local = new Map(deps.getLocal().map((task) => [task.id, task]));
    let changed = false;
    for (const row of rows) {
      if (!memory.cursor || row.updated_at > memory.cursor) {
        memory.cursor = row.updated_at;
      }
      const mine = local.get(row.id);
      const base = baseline[row.id];
      const editedHere = mine ? taskShape(mine) !== base : base !== undefined;
      if (editedHere) continue;
      const task = row.deleted_at === null ? fromTaskRow(row) : null;
      if (task) {
        baseline[row.id] = taskShape(task);
        if (!mine || taskShape(mine) !== baseline[row.id]) changed = true;
        local.set(row.id, task);
      } else {
        delete baseline[row.id];
        if (mine) changed = true;
        local.delete(row.id);
      }
    }
    if (changed) deps.setLocal([...local.values()]);
    return true;
  }

  /** 이 브라우저에서 고치거나 지운 할 일을 올림 */
  async function push(memory: TaskMemory, isStopped: () => boolean) {
    const baseline = memory.baseline;
    const tasks = deps.getLocal();
    const present = new Set(tasks.map((task) => task.id));
    const edited = tasks
      .filter((task) => taskShape(task) !== baseline[task.id])
      .map((task) => ({ task, row: deps.toRow(task) }))
      .filter((item) => item.row !== null);
    const deleted = Object.keys(baseline).filter((id) => !present.has(id));
    if (edited.length > 0) {
      await deps.upload(edited.map((item) => item.row!));
      if (isStopped()) return false;
      for (const { task } of edited) baseline[task.id] = taskShape(task);
    }
    if (deleted.length > 0) {
      await deps.markDeleted(deleted);
      if (isStopped()) return false;
      for (const id of deleted) delete baseline[id];
    }
    return true;
  }

  return createRunner(async (refresh, isStopped) => {
    const memory = deps.readMemory();
    try {
      if (!pulled || refresh) {
        if (!(await pull(memory, isStopped))) return false;
        pulled = true;
      }
      return await push(memory, isStopped);
    } finally {
      // 받거나 올린 데까지는 기억 (중간에 실패해도 다음에 그만큼 덜 함)
      if (!isStopped()) deps.writeMemory(memory);
    }
  });
}
