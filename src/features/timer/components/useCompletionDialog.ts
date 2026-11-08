"use client";

import { useEffect, useState } from "react";
import { useAutoPopupsHeld } from "@/lib/popupHold";
import { useNow } from "@/lib/useNow";
import { usePageVisible } from "@/lib/usePageVisible";
import { useTimerStore } from "../store";
import { AUTO_START_DELAY_MS } from "../timer";

// 세션 완료 팝업(CompletionDialog)이 언제 보이고, 자동 시작을 언제 세는지

/** 집중 완료 축하 효과가 보이도록 팝업을 잠깐 늦게 엽니다. (움직임 줄이기면 바로) */
const CELEBRATION_MS = 1000;

/**
 * 팝업을 보여줄지. 축하 시간이 지나고, 기다리게 하는 창(설정, 수료증)이 없을 때 처음 보입니다.
 * 한 번 보인 뒤에는 이 팝업 안에서 연 수료증 창 때문에 닫히지 않습니다.
 */
export function useShownAfterCelebration(
  key: number | null,
  celebrate: boolean,
): boolean {
  const held = useAutoPopupsHeld();
  const [readyKey, setReadyKey] = useState<number | null>(null);
  const [shownKey, setShownKey] = useState<number | null>(null);

  useEffect(() => {
    if (key === null) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const delay = celebrate && !reduceMotion ? CELEBRATION_MS : 0;
    const timer = setTimeout(() => setReadyKey(key), delay);
    return () => clearTimeout(timer);
  }, [key, celebrate]);

  const shown = key !== null && shownKey === key;
  // 렌더링 중 상태 맞추기: 처음 보이게 된 순간을 기억
  if (key !== null && !shown && readyKey === key && !held) {
    setShownKey(key);
  }
  return shown || (key !== null && readyKey === key && !held);
}

/**
 * 자동 시작 카운트다운. 팝업이 보이고(open) 탭을 보고 있는 순간부터 5초를 셉니다.
 * waiting: 자동 시작 대기 중인지 / secondsLeft: 남은 초 (세기 전에는 5)
 */
export function useAutoStartCountdown(open: boolean) {
  const timer = useTimerStore((s) => s.timer);
  const pageVisible = usePageVisible();
  const now = useNow();
  const autoStart = timer.status === "idle" ? (timer.autoStart ?? null) : null;
  const waiting = autoStart !== null;
  const at = autoStart?.at ?? null;

  useEffect(() => {
    if (open && waiting && at === null && pageVisible) {
      useTimerStore.getState().beginAutoStart();
    }
  }, [open, waiting, at, pageVisible]);

  const secondsLeft =
    at !== null && now !== null
      ? Math.max(1, Math.ceil((at - now) / 1000))
      : AUTO_START_DELAY_MS / 1000;

  return { waiting, secondsLeft };
}
