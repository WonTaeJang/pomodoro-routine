import { useTimerStore } from "@/features/timer/store";
import { unlockAudio } from "@/lib/audio";

/** 시작 버튼을 누를 때 불러서, 집중 소리를 켜 두었으면 오디오를 깨웁니다. */
export function prepareFocusSound() {
  if (useTimerStore.getState().settings.focusSound !== "off") unlockAudio();
}
