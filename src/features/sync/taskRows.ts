import {
  ESTIMATE_MAX,
  ESTIMATE_MIN,
  TITLE_MAX_LENGTH,
} from "@/features/tasks/tasks";
import type { Task } from "@/features/tasks/types";
import { isUuid } from "./uuid";

/** 서버 `tasks` 표의 한 줄 (supabase/sync-tables.sql). updated_at은 서버가 찍음 */
export type TaskRow = {
  user_id: string;
  id: string;
  title: string;
  estimate: number;
  completed_pomodoros: number;
  done: boolean;
  sort_order: number;
  created_at: string;
  completed_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
};

/** 서버에서 받아온 줄 (user_id는 내 것만 오므로 받지 않음) */
export type RemoteTaskRow = Omit<TaskRow, "user_id"> & { updated_at: string };

export const TASK_COLUMNS =
  "id,title,estimate,completed_pomodoros,done,sort_order,created_at,completed_at,archived_at,deleted_at,updated_at";

const iso = (ms: number | null) =>
  ms === null ? null : new Date(ms).toISOString();
const ms = (value: string | null) =>
  value === null ? null : Date.parse(value);
const isInt = (value: number, min: number, max = Number.MAX_SAFE_INTEGER) =>
  Number.isInteger(value) && value >= min && value <= max;

/**
 * 할 일을 서버에 올릴 모양으로 바꿉니다. 표의 제한에 맞지 않으면 null (올리지 않고 이 브라우저에만 둠).
 * 한 줄이 거절되면 같이 올린 묶음이 모두 실패하므로 미리 거름
 */
export function toTaskRow(task: Task, userId: string): TaskRow | null {
  const title = task.title.trim();
  if (!isUuid(task.id) || title.length === 0) return null;
  if (title.length > TITLE_MAX_LENGTH) return null;
  if (!isInt(task.estimate, ESTIMATE_MIN, ESTIMATE_MAX)) return null;
  if (!isInt(task.completedPomodoros, 0) || !Number.isInteger(task.order)) {
    return null;
  }
  if (!Number.isFinite(task.createdAt)) return null;
  return {
    user_id: userId,
    id: task.id,
    title,
    estimate: task.estimate,
    completed_pomodoros: task.completedPomodoros,
    done: task.done,
    sort_order: task.order,
    created_at: iso(task.createdAt)!,
    completed_at: iso(task.completedAt),
    archived_at: iso(task.archivedAt),
    deleted_at: null,
  };
}

/** 서버에서 받은 줄을 앱의 할 일로 바꿉니다. 읽을 수 없는 줄은 null */
export function fromTaskRow(row: RemoteTaskRow): Task | null {
  const createdAt = Date.parse(row.created_at);
  if (!isUuid(row.id) || Number.isNaN(createdAt)) return null;
  return {
    id: row.id,
    title: row.title,
    estimate: row.estimate,
    completedPomodoros: row.completed_pomodoros,
    done: row.done,
    order: row.sort_order,
    createdAt,
    completedAt: ms(row.completed_at),
    archivedAt: ms(row.archived_at),
  };
}

/**
 * 할 일의 "모양": 서버에 올리는 항목만 정해진 순서로 담은 문자열.
 * 서버와 같다고 확인한 모양과 비교해 바뀌었는지 가립니다.
 */
export function taskShape(task: Task): string {
  return JSON.stringify([
    task.title.trim(),
    task.estimate,
    task.completedPomodoros,
    task.done,
    task.order,
    task.createdAt,
    task.completedAt,
    task.archivedAt,
  ]);
}
