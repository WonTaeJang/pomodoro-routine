"use client";

import { useEffect, useState } from "react";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { useTimerStore } from "@/features/timer/store";

/**
 * localStorage에 저장된 값을 화면이 뜬 뒤에 불러옵니다.
 * 불러오기 전에는 false를 돌려주므로, 그동안은 기본값 대신 자리만 잡아 둔 화면을 보여줍니다.
 */
export function useHydrateStores(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      useTimerStore.persist.rehydrate(),
      useHistoryStore.persist.rehydrate(),
      useTasksStore.persist.rehydrate(),
    ]).then(() => {
      if (cancelled) return;
      // 자리를 비운 사이 끝난 세션 처리
      useTimerStore.getState().sync();
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return hydrated;
}
