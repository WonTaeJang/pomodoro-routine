"use client";

import { useEffect } from "react";
import { create } from "zustand";

/**
 * 사용자가 직접 연 창(설정, 수료증)이 떠 있는 동안, 저절로 뜨는 팝업(세션 완료 팝업)을 기다리게 합니다.
 * 브라우저 팝업(<dialog>)은 나중에 연 것이 무조건 위에 그려져서, 보고 있던 창을 덮어 버리기 때문입니다.
 */
const useHoldStore = create<{ count: number }>(() => ({ count: 0 }));

/** 이 컴포넌트가 화면에 있는 동안 저절로 뜨는 팝업을 기다리게 합니다. */
export function useHoldAutoPopups() {
  useEffect(() => {
    useHoldStore.setState((s) => ({ count: s.count + 1 }));
    return () => useHoldStore.setState((s) => ({ count: s.count - 1 }));
  }, []);
}

/** 지금 저절로 뜨는 팝업을 기다려야 하는지 */
export function useAutoPopupsHeld(): boolean {
  return useHoldStore((s) => s.count > 0);
}
