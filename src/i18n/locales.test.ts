import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "@/lib/storage";
import { detectLocale, localeInitScript } from "./locales";

describe("브라우저 언어로 화면 언어 정하기", () => {
  it("지원하는 첫 언어. 지역 표시는 뗌", () => {
    expect(detectLocale(["ko-KR", "en-US"])).toBe("ko");
    expect(detectLocale(["en-GB", "ko"])).toBe("en");
    expect(detectLocale(["ja-JP", "ko-KR"])).toBe("ko");
  });

  it("지원하는 언어가 없으면 영어", () => {
    expect(detectLocale(["ja-JP", "fr"])).toBe("en");
    expect(detectLocale([])).toBe("en");
  });
});

/** 시작 스크립트를 가짜 저장소, 브라우저 언어로 실행하고 정한 <html lang>을 돌려줌 */
function runScript(saved: string | null, languages: string[]) {
  const documentElement = { lang: "ko" };
  const localStorage = {
    getItem: (key: string) => (key === STORAGE_KEYS.locale ? saved : null),
  };
  new Function("localStorage", "navigator", "document", localeInitScript)(
    localStorage,
    { languages, language: languages[0] },
    { documentElement },
  );
  return documentElement.lang;
}

describe("화면 표시 전 언어 스크립트", () => {
  it("직접 고른 언어가 먼저", () => {
    expect(runScript("en", ["ko-KR"])).toBe("en");
    expect(runScript("ko", ["en-US"])).toBe("ko");
  });

  it("고른 적이 없으면 detectLocale과 같은 규칙", () => {
    for (const languages of [["en-US"], ["ja", "ko-KR"], ["fr"], ["ko"]]) {
      expect(runScript(null, languages)).toBe(detectLocale(languages));
    }
  });

  it("저장된 값이 이상하면 무시", () => {
    expect(runScript("xx", ["ko-KR"])).toBe("ko");
  });
});
