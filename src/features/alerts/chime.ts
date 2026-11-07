/**
 * Web Audio API로 종소리를 만듭니다. 오디오 파일이 필요 없습니다.
 * 각 음은 맑은 사인파에 한 옥타브 위 배음을 살짝 섞고, 0.01초 만에 켜졌다가 천천히 사라집니다.
 */

export type Note = {
  /** 소리 시작 기준 몇 초 뒤 */
  at: number;
  /** 음 높이(Hz) */
  freq: number;
  /** 길이(초). 기본 1.1 */
  length?: number;
  /** 상대 크기 0~1. 기본 1 */
  gain?: number;
};

const NOTE_PEAK = 0.22; // 여러 음이 겹쳐도 소리가 깨지지 않을 크기
const ATTACK = 0.01;
const DECAY = 0.25; // 클수록 천천히 사라짐
const OVERTONE = 0.25; // 배음 크기

/**
 * startTime(오디오 시계 기준 초)에 음들을 울리도록 예약합니다.
 * 오디오 시계는 탭이 숨겨져도 느려지지 않아서, 미리 예약해 두면 제때 울립니다.
 * 돌려주는 함수를 부르면 아직 시작하지 않은 소리를 취소합니다.
 */
export function scheduleNotes(
  ctx: AudioContext,
  destination: AudioNode,
  notes: Note[],
  startTime: number,
): () => void {
  const oscillators: OscillatorNode[] = [];

  for (const note of notes) {
    const t = startTime + note.at;
    const length = note.length ?? 1.1;
    const peak = NOTE_PEAK * (note.gain ?? 1);

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(peak, t + ATTACK);
    envelope.gain.setTargetAtTime(0, t + ATTACK, DECAY);
    envelope.connect(destination);

    for (const [multiple, level] of [
      [1, 1],
      [2, OVERTONE],
    ]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = note.freq * multiple;
      const partial = ctx.createGain();
      partial.gain.value = level;
      osc.connect(partial).connect(envelope);
      osc.start(t);
      osc.stop(t + length);
      oscillators.push(osc);
    }
  }

  return () => {
    for (const osc of oscillators) {
      try {
        osc.stop();
      } catch {
        // 이미 멈춘 소리
      }
      osc.disconnect();
    }
  };
}
