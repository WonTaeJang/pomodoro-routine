import type { AlertKind } from "./alerts";
import type { Note } from "./chime";

// 음 높이(Hz)
const C5 = 523.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.51;
const G6 = 1567.98;
const C7 = 2093.0;

/** 알림마다 울릴 음 */
export const ALERT_SOUNDS: Record<AlertKind, Note[]> = {
  // 집중 끝: 도-미-솔, 밝게 올라가는 3음
  "focus-end": [
    { at: 0, freq: C6 },
    { at: 0.12, freq: E6 },
    { at: 0.24, freq: G6 },
  ],
  // 사이클 완료: 도-미-솔-도, 짧은 팡파레
  "cycle-done": [
    { at: 0, freq: C6 },
    { at: 0.1, freq: E6 },
    { at: 0.2, freq: G6 },
    { at: 0.32, freq: C7, length: 1.6 },
    { at: 0.32, freq: C5, length: 1.6, gain: 0.6 },
  ],
  // 휴식 끝: 솔-도, 차분한 2음
  "break-end": [
    { at: 0, freq: G5, length: 1.2 },
    { at: 0.2, freq: C6, length: 1.2 },
  ],
};
