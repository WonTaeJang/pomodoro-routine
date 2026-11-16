import { describe, expect, it } from "vitest";
import ko from "@/i18n/messages/ko";
import en from "@/i18n/messages/en";
import {
  EARLIER_LEVEL_CHANCE,
  pickLine,
  speechPool,
  speechSituation,
  type SpeechLevel,
  type SpeechLines,
} from "./speech";

const lines: SpeechLines = ko.pet.speech;
const LEVELS: SpeechLevel[] = [1, 2, 3, 4, 5];
const BY_LEVEL = ["idle", "pat", "snack", "wake", "home", "decorated"] as const;

describe("까미 말풍선 고르기", () => {
  it("레벨 문장이 기본이고, 아래 레벨 문장은 따로 모아 둠", () => {
    const pool = speechPool(lines, "pat", 3, "day");
    expect(pool.main).toEqual(lines.pat.lv3);
    expect(pool.earlier).toEqual([...lines.pat.lv1, ...lines.pat.lv2]);
    expect(speechPool(lines, "pat", 1, "day").earlier).toEqual([]);
  });

  it("시간대 이야기는 Lv.4부터, 그 전에는 밤에 졸린 소리만", () => {
    expect(speechPool(lines, "idle", 4, "dusk").main).toEqual([
      ...lines.idle.lv4,
      ...lines.time.dusk,
    ]);
    expect(speechPool(lines, "idle", 3, "dusk").main).toEqual(lines.idle.lv3);
    expect(speechPool(lines, "idle", 2, "night").main).toEqual([
      ...lines.idle.lv2,
      ...lines.time.nightSleepy,
    ]);
  });

  it("잠은 레벨과 관계없이 한 문장, 레벨업은 그 레벨의 첫 말", () => {
    for (const level of LEVELS)
      expect(speechPool(lines, "sleep", level, "night").main).toEqual([
        lines.sleep,
      ]);
    expect(speechPool(lines, "levelUp", 2, "day").main).toEqual([
      lines.levelUp.lv2,
    ]);
  });

  it("같은 상황에서 바로 전 문장은 다시 고르지 않음", () => {
    const pool = speechPool(lines, "snack", 3, "day");
    for (const previous of pool.main)
      for (let i = 0; i < 20; i++) {
        const roll = (i + 0.5) / 20;
        const random = () => (roll < EARLIER_LEVEL_CHANCE ? 0.99 : roll);
        expect(pickLine(pool, previous, random)).not.toBe(previous);
      }
  });

  it("가끔 아래 레벨 문장이 섞임", () => {
    const pool = speechPool(lines, "pat", 5, "day");
    const rolls = [EARLIER_LEVEL_CHANCE / 2, 0];
    expect(pool.earlier).toContain(pickLine(pool, null, () => rolls.shift()!));
    const later = [EARLIER_LEVEL_CHANCE + 0.1, 0];
    expect(pool.main).toContain(pickLine(pool, null, () => later.shift()!));
  });
});

describe("말풍선 문장 사전", () => {
  it.each([
    ["ko", ko.pet.speech, 16],
    ["en", en.pet.speech, 24],
  ] as const)(
    "%s: 상황마다 다섯 레벨 모두 있고 한 줄에 들어감",
    (_, speech, max) => {
      for (const situation of BY_LEVEL)
        for (const level of LEVELS) {
          const list = speech[situation][`lv${level}`];
          expect(list.length).toBeGreaterThan(0);
          list.forEach((line) => expect(line.length).toBeLessThanOrEqual(max));
        }
    },
  );
});

describe("말할 상황 고르기", () => {
  const base = {
    pose: "idle" as const,
    levelUp: false,
    decorated: false,
    greeting: false,
    backHome: false,
  };
  it("가장 강한 이유가 이김", () => {
    expect(speechSituation({ ...base, pose: "sleeping", levelUp: true })).toBe(
      "sleep",
    );
    expect(speechSituation({ ...base, pose: "happy", levelUp: true })).toBe(
      "levelUp",
    );
    expect(speechSituation({ ...base, pose: "startled" })).toBe("wake");
    expect(speechSituation({ ...base, pose: "snacking" })).toBe("snack");
    expect(speechSituation({ ...base, pose: "happy", decorated: true })).toBe(
      "decorated",
    );
    // A pat right after waking up is about the pat.
    expect(speechSituation({ ...base, pose: "happy", greeting: true })).toBe(
      "pat",
    );
    expect(speechSituation({ ...base, greeting: true, backHome: true })).toBe(
      "wake",
    );
    expect(speechSituation({ ...base, backHome: true })).toBe("home");
    expect(speechSituation(base)).toBe("idle");
  });
});
