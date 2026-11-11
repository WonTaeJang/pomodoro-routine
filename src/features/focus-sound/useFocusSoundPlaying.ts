"use client";

import { useSyncExternalStore } from "react";
import { isFocusSoundPlaying, subscribeFocusSoundPlaying } from "./player";

/**
 * 지금 이 탭에서 집중 소리가 실제로 나오는 중인지 (집중 중 재생, 미리 듣기 모두).
 * 골라만 둔 상태, 휴식·일시정지, 소리를 내지 않는 탭, 브라우저가 아직 소리를 막고 있을 때는 false
 */
export function useFocusSoundPlaying(): boolean {
  return useSyncExternalStore(
    subscribeFocusSoundPlaying,
    isFocusSoundPlaying,
    () => false,
  );
}
