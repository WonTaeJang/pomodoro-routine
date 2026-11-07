"use client";

import { useSyncExternalStore } from "react";

/**
 * 현재 시각을 일정 간격으로 알려주는 시계.
 * 렌더링 중에 Date.now()를 직접 부르지 않도록 바깥 저장소처럼 구독합니다.
 * 서버와 첫 렌더링에서는 null을 돌려줍니다.
 */
const INTERVAL_MS = 250;

let now: number | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function tick() {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null) {
    tick();
    timer = setInterval(tick, INTERVAL_MS);
    // 다른 탭에 있다 돌아오면 바로 갱신
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", tick);
    }
  };
}

export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );
}
