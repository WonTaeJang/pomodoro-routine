import type { AlertKind } from "./alerts";
import { getAudio, setVolume } from "./audio";
import { scheduleNotes } from "./chime";
import type { AlertEnv } from "./scheduler";
import { ALERT_SOUNDS } from "./sounds";

/** 브라우저 오디오로 알림 소리를 내는 통로 (스케줄러에 끼워 씀) */
export const browserSound: AlertEnv["sound"] = {
  clock: () => getAudio()?.ctx.currentTime ?? null,
  isRunning: () => getAudio()?.ctx.state === "running",
  schedule(kind: AlertKind, time: number) {
    const audio = getAudio();
    if (!audio) return () => {};
    return scheduleNotes(audio.ctx, audio.output, ALERT_SOUNDS[kind], time);
  },
  setVolume,
};
