import { getAudio, unlockAudio } from "@/lib/audio";

/**
 * 알림 소리가 나가는 통로. 알림 소리 크기는 여기서만 바뀌어서 집중 소리와 따로 조절됩니다.
 */

type AlertOutput = { ctx: AudioContext; gain: GainNode };

let output: AlertOutput | null = null;

/** 오디오에 알림 통로를 붙여 돌려줍니다. (오디오가 없으면 null) */
function connect(ctx: AudioContext | null): AlertOutput | null {
  if (!ctx) return null;
  if (output?.ctx !== ctx) {
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    output = { ctx, gain };
  }
  return output;
}

/** 깨운 오디오와 알림 통로. 아직 오디오를 깨우지 않았으면 null */
export function getAlertOutput(): AlertOutput | null {
  return connect(getAudio());
}

/** 오디오를 깨우고 알림 통로를 돌려줍니다. (사용자가 누른 순간에 부름) */
export function unlockAlertOutput(): AlertOutput | null {
  return connect(unlockAudio());
}

/** 알림 소리 크기 0~1 */
export function setAlertVolume(volume: number) {
  const out = getAlertOutput();
  if (out) out.gain.gain.value = Math.min(1, Math.max(0, volume));
}
