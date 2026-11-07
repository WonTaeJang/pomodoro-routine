import { setVolume, unlockAudio } from "./audio";
import { scheduleNotes } from "./chime";
import { ALERT_SOUNDS } from "./sounds";

/** 설정 화면의 "미리 듣기". 버튼을 누른 순간 불러야 소리가 납니다. */
export function previewAlertSound(volume: number) {
  const audio = unlockAudio();
  if (!audio) return;
  setVolume(volume);
  scheduleNotes(
    audio.ctx,
    audio.output,
    ALERT_SOUNDS["focus-end"],
    audio.ctx.currentTime + 0.05,
  );
}
