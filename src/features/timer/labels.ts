import type { Translator } from "@/i18n";
import type { TimerMode, TimerStatus } from "./types";

/**
 * 사이클 아래 안내 문구.
 * 긴 휴식 주기를 지금 완료한 횟수 이하로 줄인 경우에도 맞게 안내합니다.
 * (짧은 휴식 중이면 다음 집중을 마쳐야 긴 휴식이므로 "1번 남았어요")
 */
export function getCycleMessage(
  t: Translator,
  mode: TimerMode,
  completedInCycle: number,
  interval: number,
): string {
  if (mode === "long-break") return t("timer.cycle.longBreakNow");
  const left = interval - Math.min(completedInCycle, interval);
  if (mode === "short-break") {
    return t("timer.cycle.untilLongBreak", { count: Math.max(1, left) });
  }
  return left === 0
    ? t("timer.cycle.nextIsLong")
    : t("timer.cycle.untilLongBreak", { count: left });
}

/** 타이머 아래 상태 문구 ("집중할 준비가 됐나요?", "까미랑 짧은 산책 중이에요" 등) */
export function getStatusMessage(
  t: Translator,
  mode: TimerMode,
  status: TimerStatus,
): string {
  if (status === "paused") return t("timer.status.paused");
  return t(`timer.status.${mode}.${status === "running" ? "running" : "idle"}`);
}
