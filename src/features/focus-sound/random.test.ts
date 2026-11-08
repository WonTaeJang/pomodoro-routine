import { describe, expect, it } from "vitest";
import { randomFocusSound } from "./random";
import { FOCUS_SOUND_IDS } from "./sounds";

const N = FOCUS_SOUND_IDS.length;

describe("세션마다 랜덤 집중 소리", () => {
  it("같은 집중 번호면 늘 같은 소리 (새로고침·다른 탭에서도 같게)", () => {
    for (let n = 0; n < 50; n++) {
      expect(randomFocusSound(n)).toBe(randomFocusSound(n));
    }
  });

  it("바로 앞 집중과 같은 소리는 나오지 않음", () => {
    for (let n = 1; n < 500; n++) {
      expect(randomFocusSound(n)).not.toBe(randomFocusSound(n - 1));
    }
  });

  it("소리 개수만큼 이어진 집중에서 모든 소리가 한 번씩 나옴", () => {
    for (let round = 0; round < 20; round++) {
      const sounds = Array.from({ length: N }, (_, i) =>
        randomFocusSound(round * N + i),
      );
      expect([...sounds].sort()).toEqual([...FOCUS_SOUND_IDS].sort());
    }
  });

  it("묶음마다 순서가 다름", () => {
    const first = Array.from({ length: N }, (_, i) => randomFocusSound(i));
    const second = Array.from({ length: N }, (_, i) => randomFocusSound(N + i));
    expect(second).not.toEqual(first);
  });
});
