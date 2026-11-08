/**
 * 앱 전체가 함께 쓰는 오디오(AudioContext) 하나. 알림 소리와 집중 소리가 같이 씁니다.
 * 브라우저는 사용자가 클릭하기 전에는 소리를 막으므로, 클릭할 때 unlockAudio()로 깨웁니다.
 */

let ctx: AudioContext | null = null;

/** 깨운 오디오. 아직 한 번도 깨우지 않았으면 null */
export function getAudio(): AudioContext | null {
  return ctx;
}

/** 사용자가 클릭, 키 입력을 할 때 불러서 오디오를 만들고 깨웁니다. */
export function unlockAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioContextClass =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
  }
  if (ctx.state !== "running") void ctx.resume();
  return ctx;
}
