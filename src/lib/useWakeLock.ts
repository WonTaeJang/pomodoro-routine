"use client";

import { useEffect } from "react";

/** 이 브라우저가 화면 꺼짐 방지(Screen Wake Lock)를 지원하는지 */
export function isWakeLockSupported(): boolean {
  return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

/**
 * active인 동안 화면이 꺼지지 않게 합니다. (Screen Wake Lock)
 * - 다른 탭으로 가면 브라우저가 자동으로 풀고, 돌아오면 다시 요청합니다.
 * - 지원하지 않거나 거절되면(배터리 절약 모드 등) 조용히 아무것도 하지 않습니다.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !isWakeLockSupported()) return;

    let sentinel: WakeLockSentinel | null = null;
    let requesting = false;
    let stopped = false;

    async function acquire() {
      if (stopped || requesting || document.visibilityState !== "visible") {
        return;
      }
      if (sentinel && !sentinel.released) return;
      requesting = true;
      try {
        const lock = await navigator.wakeLock.request("screen");
        // 기다리는 사이 타이머가 멈췄으면 바로 풂
        if (stopped) void lock.release();
        else sentinel = lock;
      } catch {
        // 거절됨: 화면이 꺼질 수 있지만 타이머는 그대로 동작
      } finally {
        requesting = false;
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", acquire);
      void sentinel?.release();
    };
  }, [active]);
}
