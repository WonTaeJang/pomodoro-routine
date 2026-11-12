import { describe, expect, it } from "vitest";
import { getTranslator } from "../translator";
import { LOCALES } from "../locales";
import { MESSAGES } from ".";

/** 사전의 모든 문구 키 ("timer.modes.focus" 꼴) */
function keysOf(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    keysOf(v, prefix ? `${prefix}.${k}` : k),
  );
}

/** 문구에 쓰는 모든 자리의 예시 값 */
const SAMPLE_VALUES = {
  count: 2,
  done: 1,
  total: 4,
  position: 1,
  estimate: 3,
  minutes: 25,
  seconds: 5,
  focusCount: 3,
  cycles: 1,
  number: 7,
  value: 25,
  title: "할 일",
  label: "집중 시간",
  mode: "집중",
  walk: "long",
  sound: "빗소리",
  date: "2026.11.07",
  length: "25분",
  diff: "+10분",
  name: "까미",
  provider: "Google",
  max: 20,
  level: 2,
  points: 24,
  next: 60,
  earned: 4,
  paw: () => "🐾",
  nowrap: (chunks: string) => chunks,
};

describe("화면 문구 사전", () => {
  it("모든 언어가 같은 문구 키를 가짐", () => {
    const ko = keysOf(MESSAGES.ko).sort();
    for (const locale of LOCALES) {
      expect(keysOf(MESSAGES[locale]).sort()).toEqual(ko);
    }
  });

  it.each(LOCALES)("%s: 모든 문구가 형식 오류 없이 만들어짐", (locale) => {
    const errors: string[] = [];
    const t = getTranslator(locale);
    for (const key of keysOf(MESSAGES[locale])) {
      try {
        // @ts-expect-error 키를 문자열로 모아서 넘김
        const text = t.markup(key, SAMPLE_VALUES);
        if (!text || text === key) errors.push(key);
      } catch (error) {
        errors.push(`${key}: ${String(error)}`);
      }
    }
    expect(errors).toEqual([]);
  });
});
