import { describe, expect, it } from "vitest";
import { onboardingSlides, shouldShowOnboarding } from "./onboarding";

describe("첫 방문 안내", () => {
  it("처음 방문하고 기록이 없을 때, 타이머 화면에서만 띄운다", () => {
    const first = { seen: false, hasRecords: false, onTimerPage: true };
    expect(shouldShowOnboarding(first)).toBe(true);
    expect(shouldShowOnboarding({ ...first, seen: true })).toBe(false);
    expect(shouldShowOnboarding({ ...first, hasRecords: true })).toBe(false);
    expect(shouldShowOnboarding({ ...first, onTimerPage: false })).toBe(false);
  });

  it("키보드가 없는 기기는 단축키 장을 뺀다", () => {
    expect(onboardingSlides(true).map((s) => s.id)).toEqual([
      "welcome",
      "start",
      "more",
      "shortcuts",
    ]);
    expect(onboardingSlides(false).map((s) => s.id)).toEqual([
      "welcome",
      "start",
      "more",
    ]);
  });
});
