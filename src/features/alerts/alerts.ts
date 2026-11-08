import type {
  CompletedSession,
  TimerSettings,
  TimerState,
} from "@/features/timer/types";

/**
 * 세션이 끝날 때의 알림 규칙 (소리, 브라우저 알림 공통).
 * 화면이나 브라우저 API 없이 계산만 하므로 테스트할 수 있습니다.
 */

export type AlertKind = "focus-end" | "break-end" | "cycle-done";

export const ALERT_MESSAGES: Record<
  AlertKind,
  { title: string; body: string }
> = {
  "focus-end": {
    title: "집중 끝! 🐾",
    body: "수고했어요. 까미랑 짧은 산책 다녀와요.",
  },
  "cycle-done": {
    title: "한 사이클 완료! 🏅",
    body: "집중을 모두 마쳤어요. 까미랑 긴 산책 다녀와요.",
  },
  "break-end": {
    title: "휴식 끝!",
    body: "까미가 기다리고 있어요. 다시 집중해볼까요?",
  },
};

/** 끝난 세션에 맞는 알림 */
export function alertKindForSession(
  session: Pick<CompletedSession, "mode" | "cycleCompleted">,
): AlertKind {
  if (session.mode !== "focus") return "break-end";
  return session.cycleCompleted ? "cycle-done" : "focus-end";
}

type UpcomingAlert = {
  /** 알릴 시각(epoch ms) = 지금 세션이 끝나는 시각 */
  at: number;
  kind: AlertKind;
};

/** 진행 중인 세션이 끝날 때 울릴 알림. 진행 중이 아니면 null */
export function getUpcomingAlert(
  timer: TimerState,
  settings: Pick<TimerSettings, "longBreakInterval">,
): UpcomingAlert | null {
  if (timer.status !== "running" || timer.endsAt === null) return null;
  if (timer.mode !== "focus") return { at: timer.endsAt, kind: "break-end" };
  const cycleDone = timer.completedInCycle + 1 >= settings.longBreakInterval;
  return { at: timer.endsAt, kind: cycleDone ? "cycle-done" : "focus-end" };
}
