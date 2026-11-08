import { focusSessions, taskTitleOf } from "@/features/history/sessions";
import type { Task } from "@/features/tasks/types";
import type { CompletedSession } from "@/features/timer/types";
import { APP_NAME } from "@/lib/brand";
import { startOfDay } from "@/lib/date";

/** "까모도로 수료증" */
export const CERTIFICATE_TITLE = `${APP_NAME} 수료증`;

/** 수료증에 들어가는 값 */
export type CertificateData = {
  /** 몇 번째로 완료한 사이클인지 (제 N호) */
  number: number;
  /** 사이클을 마친 시각 */
  completedAt: number;
  /** 이 사이클의 집중 횟수 */
  focusCount: number;
  /** 집중 한 번의 길이. 사이클 중에 시간을 바꿔서 길이가 섞였으면 null */
  focusEachMs: number | null;
  /** 이 사이클에서 집중한 시간 합계 */
  focusTotalMs: number;
  /** 사이클을 마친 날, 이 사이클까지 완료한 사이클 수 */
  cyclesThatDay: number;
  /** 이 사이클에 집중한 할 일 제목 (집중한 순서, 중복 없이) */
  taskTitles: string[];
};

/**
 * 가장 최근에 완료한 사이클의 수료증 내용을 만듭니다. 완료한 사이클이 없으면 null.
 * 사이클 = 직전 사이클이 끝난 뒤부터 이번 사이클을 마친 집중까지의 집중 세션들
 */
export function getLatestCertificate(
  sessions: CompletedSession[],
  tasks: Task[],
): CertificateData | null {
  const focus = focusSessions(sessions);
  const ends = focus.flatMap((s, i) => (s.cycleCompleted ? [i] : []));
  if (ends.length === 0) return null;

  const end = ends[ends.length - 1];
  const start = ends.length > 1 ? ends[ends.length - 2] + 1 : 0;
  const cycle = focus.slice(start, end + 1);
  const completedAt = focus[end].endedAt;

  const durations = new Set(cycle.map((s) => s.durationMs));
  const dayStart = startOfDay(completedAt);
  const titleOf = taskTitleOf(tasks);
  const taskTitles = [
    ...new Set(
      cycle.flatMap((s) => {
        const title = titleOf(s);
        return title ? [title] : [];
      }),
    ),
  ];

  return {
    number: ends.length,
    completedAt,
    focusCount: cycle.length,
    focusEachMs: durations.size === 1 ? cycle[0].durationMs : null,
    focusTotalMs: cycle.reduce((sum, s) => sum + s.durationMs, 0),
    cyclesThatDay: ends.filter((i) => focus[i].endedAt >= dayStart).length,
    taskTitles,
  };
}

/** 시간 길이를 "25분", "1시간 40분", "5초"처럼 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}초`;
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}분`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`;
}

/** 수료증 본문. 예: "25분 집중을 4번 해내었기에" / "이 수료증을 드립니다." */
export function getCertificateMessage(data: CertificateData): [string, string] {
  const what =
    data.focusEachMs === null
      ? `집중을 ${data.focusCount}번`
      : `${formatDuration(data.focusEachMs)} 집중을 ${data.focusCount}번`;
  return [`${what} 해내었기에`, "이 수료증을 드립니다."];
}
