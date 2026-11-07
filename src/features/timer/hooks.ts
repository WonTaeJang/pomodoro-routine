"use client";

import { useEffect } from "react";
import { MODE_LABELS } from "./labels";
import { useTimerStore } from "./store";
import type { TimerState } from "./types";

/** 진행 중인 세션의 시간이 다 되면 다음 세션으로 넘깁니다. */
export function useCompleteWhenDue(timer: TimerState, now: number | null) {
  const { status, endsAt } = timer;

  useEffect(() => {
    if (
      status === "running" &&
      endsAt !== null &&
      now !== null &&
      now >= endsAt
    ) {
      useTimerStore.getState().sync();
    }
  }, [status, endsAt, now]);
}

/** 브라우저 탭 제목에 남은 시간을 표시합니다. (예: "24:13 · 집중 | 까미도로") */
export function useTimerTitle(
  ready: boolean,
  timer: TimerState,
  timeText: string,
) {
  const { status, mode } = timer;

  useEffect(() => {
    document.title =
      ready && status !== "idle"
        ? `${timeText} · ${MODE_LABELS[mode]} | 까미도로`
        : "까미도로";
  }, [ready, status, mode, timeText]);
}
