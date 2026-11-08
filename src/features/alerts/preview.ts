import { scheduleNotes } from "./chime";
import { setAlertVolume, unlockAlertOutput } from "./output";
import { ALERT_SOUNDS } from "./sounds";

/** 설정 화면의 "미리 듣기". 버튼을 누른 순간 불러야 소리가 납니다. */
export function previewAlertSound(volume: number) {
  const out = unlockAlertOutput();
  if (!out) return;
  setAlertVolume(volume);
  scheduleNotes(
    out.ctx,
    out.gain,
    ALERT_SOUNDS["focus-end"],
    out.ctx.currentTime + 0.05,
  );
}
