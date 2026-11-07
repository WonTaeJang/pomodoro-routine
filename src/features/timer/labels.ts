import type { TimerMode, TimerStatus } from "./types";

export const MODE_LABELS: Record<TimerMode, string> = {
  focus: "집중",
  "short-break": "짧은 휴식",
  "long-break": "긴 휴식",
};

/**
 * 사이클 아래 안내 문구.
 * 긴 휴식 주기를 지금 완료한 횟수 이하로 줄인 경우에도 맞게 안내합니다.
 * (짧은 휴식 중이면 다음 집중을 마쳐야 긴 휴식이므로 "1번 남았어요")
 */
export function getCycleMessage(
  mode: TimerMode,
  completedInCycle: number,
  interval: number,
): string {
  if (mode === "long-break") return "긴 휴식 시간이에요";
  const left = interval - Math.min(completedInCycle, interval);
  if (mode === "short-break") {
    return `긴 휴식까지 ${Math.max(1, left)}번 남았어요`;
  }
  return left === 0
    ? "이번 휴식은 긴 휴식이에요"
    : `긴 휴식까지 ${left}번 남았어요`;
}

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
