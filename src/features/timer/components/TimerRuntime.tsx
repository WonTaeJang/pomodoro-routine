"use client";

import { useAlerts } from "@/features/alerts";
import { useNow } from "@/lib/useNow";
import { useWakeLock } from "@/lib/useWakeLock";
import { useCompleteWhenDue, useTimerTitle } from "../hooks";
import { useTimerStore } from "../store";
import { formatRemaining, getRemainingMs } from "../timer";
import { CompletionDialog } from "./CompletionDialog";

type TimerRuntimeProps = {
  /** 저장된 값을 불러오기 전이면 false */
  ready: boolean;
};

/**
 * 어느 페이지에 있든 타이머가 하는 일: 시간이 되면 다음으로 넘기기, 알림, 탭 제목,
 * 화면 켜두기, 완료 팝업. 앱 틀(AppShell)에 한 번만 둡니다.
 */
export function TimerRuntime({ ready }: TimerRuntimeProps) {
  const timer = useTimerStore((s) => s.timer);
  const keepAwake = useTimerStore(
    (s) => s.timer.status === "running" && s.settings.keepScreenOn,
  );
  const now = useNow();
  const remainingMs =
    now === null ? timer.remainingMs : getRemainingMs(timer, now);

  useCompleteWhenDue(timer, now);
  useTimerTitle(ready, timer, formatRemaining(remainingMs));
  useAlerts(ready);
  useWakeLock(ready && keepAwake);

  return ready ? <CompletionDialog /> : null;
}
