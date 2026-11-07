import type { TimerMode, TimerStatus } from "./types";

export const MODE_LABELS: Record<TimerMode, string> = {
  focus: "집중",
  "short-break": "짧은 휴식",
  "long-break": "긴 휴식",
};

export function getStatusMessage(mode: TimerMode, status: TimerStatus): string {
  if (status === "paused") return "잠시 멈췄어요";
  if (mode === "focus") {
    return status === "running" ? "집중하고 있어요" : "집중할 준비가 됐나요?";
  }
  const walk = mode === "short-break" ? "짧은 산책" : "긴 산책";
  return status === "running"
    ? `까미랑 ${walk} 중이에요`
    : `까미랑 ${walk}할 시간이에요`;
}
