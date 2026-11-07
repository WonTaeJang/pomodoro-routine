/**
 * 앱 전체가 함께 쓰는 오디오 하나.
 * 브라우저는 사용자가 클릭하기 전에는 소리를 막으므로, 클릭할 때 unlockAudio()로 깨웁니다.
 */

type Audio = { ctx: AudioContext; output: GainNode };

let audio: Audio | null = null;

/** 깨운 오디오. 아직 한 번도 깨우지 않았으면 null */
export function getAudio(): Audio | null {
  return audio;
}

/** 사용자가 클릭, 키 입력을 할 때 불러서 오디오를 만들고 깨웁니다. */
export function unlockAudio(): Audio | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    const AudioContextClass =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    const output = ctx.createGain();
    output.connect(ctx.destination);
    audio = { ctx, output };
  }
  if (audio.ctx.state === "suspended") void audio.ctx.resume();
  return audio;
}

/** 전체 소리 크기 0~1 */
export function setVolume(volume: number) {
  if (audio) audio.output.gain.value = Math.min(1, Math.max(0, volume));
}
