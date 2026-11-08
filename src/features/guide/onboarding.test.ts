import { describe, expect, it } from "vitest";
import { GUIDE_CONTENT, INLINE_ICON_NAMES } from "./content";
import { onboardingSlides, shouldShowOnboarding } from "./onboarding";

const { ko, en } = GUIDE_CONTENT;

describe("첫 방문 안내", () => {
  it("처음 방문하고 기록이 없을 때, 타이머 화면에서만 띄운다", () => {
    const first = { seen: false, hasRecords: false, onTimerPage: true };
    expect(shouldShowOnboarding(first)).toBe(true);
    expect(shouldShowOnboarding({ ...first, seen: true })).toBe(false);
    expect(shouldShowOnboarding({ ...first, hasRecords: true })).toBe(false);
    expect(shouldShowOnboarding({ ...first, onTimerPage: false })).toBe(false);
  });

  it("키보드가 없는 기기는 단축키 장을 뺀다", () => {
    expect(onboardingSlides(ko.slides, true).map((s) => s.id)).toEqual([
      "welcome",
      "start",
      "more",
      "shortcuts",
    ]);
    expect(onboardingSlides(ko.slides, false).map((s) => s.id)).toEqual([
      "welcome",
      "start",
      "more",
    ]);
  });
});

describe("사용법 글의 언어별 짝", () => {
  const ids = (items: { id: string }[]) => items.map((item) => item.id);

  it("언어가 달라도 섹션과 안내 장이 같은 순서 (목차 주소가 같게)", () => {
    expect(ids(en.sections)).toEqual(ids(ko.sections));
    expect(ids(en.slides)).toEqual(ids(ko.slides));
    expect(en.sections.map((s) => s.icon)).toEqual(
      ko.sections.map((s) => s.icon),
    );
  });

  it("글 속 아이콘 자리표시는 있는 아이콘만", () => {
    for (const content of [ko, en]) {
      const points = [...content.sections, ...content.slides].flatMap(
        (item) => item.points,
      );
      const used = points.flatMap((point) =>
        [...point.matchAll(/\{(\w+)\}/g)].map((match) => match[1]),
      );
      for (const name of used) expect(INLINE_ICON_NAMES).toContain(name);
    }
  });
});
