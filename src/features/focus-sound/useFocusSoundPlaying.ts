"use client";

import { useSyncExternalStore } from "react";
import {
  getAudibleFocusSound,
  isFocusSoundPlaying,
  subscribeFocusSoundPlaying,
} from "./player";
import type { FocusSoundId } from "./sounds";

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

/** 지금 이 탭에서 실제로 들리는 집중 소리 (랜덤이면 이번에 고른 소리). 들리지 않으면 null */
export function useAudibleFocusSound(): FocusSoundId | null {
  return useSyncExternalStore(
    subscribeFocusSoundPlaying,
    getAudibleFocusSound,
    () => null,
  );
}
