import { describe, expect, it } from "vitest";
import { seededRandom } from "@/lib/random";
import {
  brownNoise,
  loopSeamlessly,
  normalize,
  pinkNoise,
  whiteNoise,
} from "./noise";
import { FOCUS_SOUNDS, FOCUS_SOUND_IDS } from "./sounds";

const LENGTH = 16_000;

const rms = (x: Float32Array) =>
  Math.sqrt(x.reduce((sum, v) => sum + v * v, 0) / x.length);

/** 이웃한 샘플끼리 얼마나 크게 바뀌는지 (높은 소리가 많을수록 큼) */
function roughness(x: Float32Array) {
  let sum = 0;
  for (let i = 1; i < x.length; i++) sum += Math.abs(x[i] - x[i - 1]);
  return sum / (x.length - 1) / rms(x);
}

describe("소리 만들기", () => {
  it("같은 난수면 똑같은 소리, 값은 -1~1 (크기 맞춘 뒤)", () => {
    for (const id of FOCUS_SOUND_IDS) {
      const sound = FOCUS_SOUNDS[id];
      if (sound.kind !== "synth") continue;
      const make = () => {
        const x = sound.generate(LENGTH, seededRandom(1));
        normalize(x, 0.2);
        return x;
      };
      const a = make();
      expect(a).toEqual(make());
      expect(a.every((v) => Number.isFinite(v) && v >= -1 && v <= 1)).toBe(
        true,
      );
      expect(rms(a)).toBeGreaterThan(0.15);
    }
  });

  it("백색 → 핑크 → 브라운 순서로 높은 소리가 줄어듦", () => {
    const white = roughness(whiteNoise(LENGTH, seededRandom(1)));
    const pink = roughness(pinkNoise(LENGTH, seededRandom(1)));
    const brown = roughness(brownNoise(LENGTH, seededRandom(1)));
    expect(white).toBeGreaterThan(pink);
    expect(pink).toBeGreaterThan(brown);
  });
});

describe("끊김 없이 반복", () => {
  it("겹친 만큼 짧아지고, 끝 다음에 오는 첫 샘플이 원래 흐름의 다음 샘플", () => {
    const raw = brownNoise(1000, seededRandom(3));
    const loop = loopSeamlessly(raw, 100);
    expect(loop).toHaveLength(900);
    expect(loop[899]).toBe(raw[899]);
    expect(loop[0]).toBeCloseTo(raw[900], 6);
    // 겹친 구간이 끝나면 원래 소리 그대로
    expect(loop[500]).toBe(raw[500]);
  });
});
