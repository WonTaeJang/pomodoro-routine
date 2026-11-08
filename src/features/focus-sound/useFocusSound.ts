"use client";

import { useEffect } from "react";
import { useFocusRunning } from "@/features/timer/hooks";
import { useTimerStore } from "@/features/timer/store";
import { useIsSoundTab } from "@/lib/soundTab";
import { resumeFocusSound, setFocusSound } from "./player";

/**
 * 집중이 진행 중일 때만 고른 집중 소리를 틀어 둡니다. 앱 틀(TimerRuntime)에서 한 번만 씁니다.
 * 휴식, 일시정지, 끝나면 서서히 꺼집니다. 탭을 여러 개 열면 소리를 낼 탭 하나에서만 납니다.
 */
export function useFocusSound(ready: boolean) {
  const sound = useTimerStore((s) => s.settings.focusSound);
  const volume = useTimerStore((s) => s.settings.focusSoundVolume);
  const focusing = useFocusRunning();
  const soundTab = useIsSoundTab();
  const on = ready && focusing && soundTab && sound !== "off";

  useEffect(() => {
    setFocusSound(on ? { id: sound, volume } : null);
  }, [on, sound, volume]);

  // 새로고침 뒤 집중이 이어지는 중이면 처음 누를 때 소리를 깨우고,
  // 다른 탭·앱에 다녀오면 멈춘 소리를 다시 깨움
  useEffect(() => {
    if (!on) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") resumeFocusSound();
    };
    window.addEventListener("pointerdown", resumeFocusSound);
    window.addEventListener("keydown", resumeFocusSound);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pointerdown", resumeFocusSound);
      window.removeEventListener("keydown", resumeFocusSound);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [on]);

  // 페이지를 떠날 때는 끔
  useEffect(() => () => setFocusSound(null), []);
}
