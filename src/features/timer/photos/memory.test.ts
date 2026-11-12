import { describe, expect, it } from "vitest";
import {
  choosePhoto,
  parsePhotoMemory,
  pickIndex,
  shownIndex,
  type PhotoMemory,
} from "./memory";

const empty: PhotoMemory = { slots: {}, last: {} };
/** 항상 같은 값을 돌려주는 랜덤 */
const fixed = (value: number) => () => value;

describe("pickIndex", () => {
  it("한 장뿐이면 0", () => {
    expect(pickIndex(1, 0, fixed(0.9))).toBe(0);
  });

  it("피할 사진이 없으면 전체에서 고름", () => {
    expect(pickIndex(5, undefined, fixed(0))).toBe(0);
    expect(pickIndex(5, undefined, fixed(0.99))).toBe(4);
  });

  it("바로 전 사진은 어떤 랜덤 값에도 다시 나오지 않음", () => {
    for (let avoid = 0; avoid < 4; avoid++) {
      for (const r of [0, 0.2, 0.4, 0.6, 0.8, 0.99]) {
        const index = pickIndex(4, avoid, fixed(r));
        expect(index).not.toBe(avoid);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(4);
      }
    }
  });

  it("피할 번호가 범위를 벗어나면(묶음이 줄어든 경우) 무시", () => {
    expect(pickIndex(3, 7, fixed(0))).toBe(0);
  });
});

describe("choosePhoto", () => {
  it("처음에는 묶음에서 골라 자리와 묶음별 마지막 사진을 기억", () => {
    const next = choosePhoto(empty, "timer", "focus", "focus", 7, fixed(0.5));
    expect(next.slots.timer).toEqual({ key: "focus", index: 3 });
    expect(next.last.focus).toBe(3);
  });

  it("같은 세션이면 그대로 (일시정지·새로고침해도 같은 사진)", () => {
    const first = choosePhoto(empty, "timer", "focus", "focus", 7, fixed(0.5));
    expect(choosePhoto(first, "timer", "focus", "focus", 7, fixed(0))).toBe(
      first,
    );
  });

  it("세션이 바뀌면 새로 고르고, 그 묶음의 바로 전 사진은 피함", () => {
    let memory = choosePhoto(empty, "timer", "focus", "focus", 2, fixed(0));
    expect(memory.slots.timer?.index).toBe(0);
    memory = choosePhoto(memory, "timer", "default", "default", 5, fixed(0));
    memory = choosePhoto(memory, "timer", "focus", "focus", 2, fixed(0));
    // 두 장 중 바로 전(0)을 피해서 1
    expect(memory.slots.timer).toEqual({ key: "focus", index: 1 });
    expect(memory.last).toEqual({ focus: 1, default: 0 });
  });

  it("자리마다 따로 기억 (완료 팝업이 타이머 사진을 바꾸지 않음)", () => {
    let memory = choosePhoto(empty, "timer", "default", "default", 5, fixed(0));
    memory = choosePhoto(memory, "completion", "done:1", "done", 4, fixed(0));
    expect(shownIndex(memory, "timer", "default", 5)).toBe(0);
    expect(shownIndex(memory, "completion", "done:1", 4)).toBe(0);
  });
});

describe("shownIndex", () => {
  it("세션이 다르거나 번호가 범위를 벗어나면 null", () => {
    const memory: PhotoMemory = {
      slots: { timer: { key: "focus", index: 6 } },
      last: {},
    };
    expect(shownIndex(memory, "timer", "focus", 7)).toBe(6);
    expect(shownIndex(memory, "timer", "default", 7)).toBeNull();
    expect(shownIndex(memory, "timer", "focus", 3)).toBeNull();
    expect(shownIndex(memory, "completion", "focus", 7)).toBeNull();
  });
});

describe("parsePhotoMemory", () => {
  it("없거나 깨진 값은 빈 기억", () => {
    expect(parsePhotoMemory(null)).toEqual(empty);
    expect(parsePhotoMemory("{")).toEqual(empty);
    expect(parsePhotoMemory("[1]")).toEqual(empty);
    expect(parsePhotoMemory('{"slots":3}')).toEqual(empty);
  });

  it("저장한 값을 그대로 읽음", () => {
    const memory = choosePhoto(empty, "timer", "focus", "focus", 7, fixed(0.5));
    expect(parsePhotoMemory(JSON.stringify(memory))).toEqual(memory);
  });
});
