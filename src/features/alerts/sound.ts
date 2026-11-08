import { getAudio } from "@/lib/audio";
import type { AlertKind } from "./alerts";
import { scheduleNotes } from "./chime";
import { getAlertOutput, setAlertVolume } from "./output";
import type { AlertEnv } from "./scheduler";
import { ALERT_SOUNDS } from "./sounds";

/** 브라우저 오디오로 알림 소리를 내는 통로 (스케줄러에 끼워 씀) */
export const browserSound: AlertEnv["sound"] = {
  clock: () => getAudio()?.currentTime ?? null,
  isRunning: () => getAudio()?.state === "running",
  schedule(kind: AlertKind, time: number) {
    const out = getAlertOutput();
    if (!out) return () => {};
    return scheduleNotes(out.ctx, out.gain, ALERT_SOUNDS[kind], time);
  },
  setVolume: setAlertVolume,
};
