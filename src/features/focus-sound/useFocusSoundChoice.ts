"use client";

import { useHistoryStore } from "@/features/history/store";
import { useTimerStore } from "@/features/timer/store";
import { randomFocusSound } from "./random";
import type { FocusSoundId, FocusSoundSetting } from "./sounds";

type FocusSoundChoice = {
  /** 고른 설정 (소리, 끄기, 랜덤) */
  setting: FocusSoundSetting;
  /** 실제로 틀 소리. 끄기면 null. 랜덤이면 이번(집중 중이 아니면 다음) 집중의 소리 */
  sound: FocusSoundId | null;
  /** 랜덤을 고르면 틀 소리 (랜덤을 고른 순간 미리 듣기용) */
  randomSound: FocusSoundId;
};

/**
 * 고른 집중 소리와 실제로 틀 소리.
 * 랜덤이면 지금까지 마친 집중 횟수로 소리를 정해서, 집중을 하나 마칠 때마다 다음 소리로 바뀝니다.
 */
export function useFocusSoundChoice(): FocusSoundChoice {
  const setting = useTimerStore((s) => s.settings.focusSound);
  const focusCount = useHistoryStore(
    (s) => s.sessions.filter((session) => session.mode === "focus").length,
  );
  const randomSound = randomFocusSound(focusCount);
  const sound =
    setting === "off" ? null : setting === "random" ? randomSound : setting;
  return { setting, sound, randomSound };
}
