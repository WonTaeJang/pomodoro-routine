import type { Task } from "@/features/tasks/types";
import type { CompletedSession } from "@/features/timer/types";

/** 집중 세션만, 끝난 순서대로 */
export function focusSessions(
  sessions: CompletedSession[],
): CompletedSession[] {
  return sessions
    .filter((s) => s.mode === "focus")
    .sort((a, b) => a.endedAt - b.endedAt);
}

/**
 * 집중 세션의 할 일 제목을 찾는 함수를 만듭니다.
 * 기록에 남긴 제목을 먼저 쓰고, 예전 기록(제목 없음)은 지금 남아 있는 할 일에서 찾습니다.
 */
export function taskTitleOf(
  tasks: Task[],
): (session: CompletedSession) => string | undefined {
  const titleById = new Map(tasks.map((t) => [t.id, t.title]));
  return (session) =>
    session.taskTitle ??
    (session.taskId ? titleById.get(session.taskId) : undefined);
}
