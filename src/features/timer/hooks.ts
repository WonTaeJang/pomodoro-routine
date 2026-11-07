"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/brand";
import { MODE_LABELS } from "./labels";
import { useTimerStore } from "./store";
import type { TimerState } from "./types";

/** 지금 세션을 구분하는 값. 시작, 일시정지, 끝남, 모드 변경마다 달라집니다. */
function sessionKey(timer: TimerState): string {
  return `${timer.mode}:${timer.status}:${timer.endsAt ?? timer.remainingMs}`;
}

/**
 * 지금 세션에서만 유효한 상태 (예: 열어 둔 확인 팝업).
 * 팝업을 열어 둔 사이 세션이 끝나거나 바뀌면 처음 값으로 돌아갑니다.
 * 예: "집중을 건너뛸까요?"를 띄운 채 집중이 끝나면, 그대로 확인했을 때 휴식이 건너뛰어지지 않도록 팝업을 닫음
 */
export function useSessionState<T>(initial: T): [T, (value: T) => void] {
  const key = useTimerStore((s) => sessionKey(s.timer));
  const [state, setState] = useState({ key, value: initial });
  const value = state.key === key ? state.value : initial;
  return [value, (next) => setState({ key, value: next })];
}

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

/** 브라우저 탭 제목에 남은 시간을 표시합니다. (예: "24:13 · 집중 | 까모도로") */
export function useTimerTitle(
  ready: boolean,
  timer: TimerState,
  timeText: string,
) {
  const { status, mode } = timer;

  useEffect(() => {
    document.title =
      ready && status !== "idle"
        ? `${timeText} · ${MODE_LABELS[mode]} | ${APP_NAME}`
        : APP_NAME;
  }, [ready, status, mode, timeText]);
}
