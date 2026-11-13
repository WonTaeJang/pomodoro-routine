"use client";

import { useSyncExternalStore } from "react";

/** 키보드가 없는 기기(휴대폰·태블릿 터치). 단축키 안내를 숨기는 CSS(mixin keyboard-only)와 같은 기준 */
export const TOUCH_ONLY_QUERY = "(hover: none) and (pointer: coarse)";

/**
 * 미디어 쿼리가 맞는지. 기기 상태가 바뀌면 다시 그립니다.
 * 서버와 첫 화면에서는 `serverValue`를 씁니다.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
