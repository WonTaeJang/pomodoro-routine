import { TITLE_MAX_LENGTH } from "@/features/tasks/tasks";
import {
  TIMER_MODES,
  type CompletedSession,
  type TimerMode,
} from "@/features/timer/types";
import { isUuid } from "./uuid";

/** 서버 `sessions` 표의 한 줄 (supabase/sync-tables.sql) */
export type SessionRow = {
  user_id: string;
  mode: TimerMode;
  /** 끝난 시각 (ISO 문자열) */
  ended_at: string;
  duration_ms: number;
  task_id: string | null;
  task_title: string | null;
  cycle_completed: boolean;
};

/** 서버에서 받아올 열 (user_id는 내 것만 오므로 받지 않음) */
export const SESSION_COLUMNS =
  "mode,ended_at,duration_ms,task_id,task_title,cycle_completed";

const MODES: readonly string[] = TIMER_MODES;

/**
 * 기록을 서버에 올릴 모양으로 바꿉니다. 표의 제한에 맞지 않는 기록은 null
 * (한 줄이 거절되면 같이 올린 묶음이 모두 실패하므로 미리 거름).
 */
export function toSessionRow(
  session: CompletedSession,
  userId: string,
): SessionRow | null {
  const duration = Math.round(session.durationMs);
  if (!MODES.includes(session.mode)) return null;
  if (!Number.isFinite(session.endedAt) || !(duration > 0)) return null;
  return {
    user_id: userId,
    mode: session.mode,
    ended_at: new Date(session.endedAt).toISOString(),
    duration_ms: duration,
    // 표의 task_id는 uuid. 아니면 비워 두고 제목만 남김
    task_id: isUuid(session.taskId) ? session.taskId : null,
    task_title: session.taskTitle?.slice(0, TITLE_MAX_LENGTH) || null,
    cycle_completed: session.cycleCompleted === true,
  };
}

/** 서버에서 받은 한 줄을 앱의 기록으로 바꿉니다. 읽을 수 없는 줄은 null */
export function fromSessionRow(
  row: Omit<SessionRow, "user_id">,
): CompletedSession | null {
  const endedAt = Date.parse(row.ended_at);
  if (!MODES.includes(row.mode) || Number.isNaN(endedAt)) return null;
  return {
    mode: row.mode,
    endedAt,
    durationMs: row.duration_ms,
    // 앱의 기록은 없는 값을 아예 두지 않음 (브라우저에 저장한 모양과 같게)
    ...(row.task_id ? { taskId: row.task_id } : {}),
    ...(row.task_title ? { taskTitle: row.task_title } : {}),
    ...(row.cycle_completed ? { cycleCompleted: true } : {}),
  };
}
