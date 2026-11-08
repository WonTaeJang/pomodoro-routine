"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/features/timer/store";
import { getAudio, unlockAudio } from "@/lib/audio";
import { isSoundTab, subscribeSoundTab } from "@/lib/soundTab";
import { showNotification } from "./notify";
import { createAlertScheduler } from "./scheduler";
import { browserSound } from "./sound";

/**
 * 세션이 끝날 때 소리와 브라우저 알림을 냅니다. 앱 틀(TimerRuntime)에서 한 번만 씁니다.
 * 예약, 취소, 중복 방지 규칙은 scheduler.ts에 있고, 여기서는 브라우저 기능과 타이머를 연결합니다.
 */
export function useAlerts(ready: boolean) {
  useEffect(() => {
    if (!ready) return;

    const scheduler = createAlertScheduler({
      now: () => Date.now(),
      getState: () => useTimerStore.getState(),
      sync: () => useTimerStore.getState().sync(),
      sound: browserSound,
      notify: showNotification,
      isHidden: () => document.visibilityState === "hidden",
      isSoundTab,
      setTimer: (fn, ms) => window.setTimeout(fn, ms),
      clearTimer: (id) => window.clearTimeout(id as number),
    });

    const unsubscribe = useTimerStore.subscribe((state, prev) => {
      if (state.lastCompleted && state.lastCompleted !== prev.lastCompleted) {
        scheduler.onComplete(state.lastCompleted);
      }
      scheduler.plan();
    });

    // 새로고침 뒤 진행 중이던 타이머처럼, 시작 버튼을 누르지 않았어도
    // 화면 어디든 처음 누르면 오디오를 깨우고 소리를 다시 예약
    function onUserGesture() {
      if (!useTimerStore.getState().settings.soundEnabled) return;
      const hadAudio = getAudio() !== null;
      unlockAudio();
      if (!hadAudio) scheduler.plan(true);
    }
    window.addEventListener("pointerdown", onUserGesture);
    window.addEventListener("keydown", onUserGesture);
    // 소리를 낼 탭이 바뀌면 예약한 소리를 옮김
    const unsubscribeSoundTab = subscribeSoundTab(() => scheduler.plan());

    scheduler.plan();

    return () => {
      unsubscribe();
      unsubscribeSoundTab();
      scheduler.dispose();
      window.removeEventListener("pointerdown", onUserGesture);
      window.removeEventListener("keydown", onUserGesture);
    };
  }, [ready]);
}
