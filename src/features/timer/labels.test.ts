import { describe, expect, it } from "vitest";
import { getTranslator } from "@/i18n";
import { getCycleMessage, getStatusMessage } from "./labels";

const ko = getTranslator("ko");
const en = getTranslator("en");

describe("사이클 안내 문구", () => {
  it("집중 중에는 긴 휴식까지 남은 횟수", () => {
    expect(getCycleMessage(ko, "focus", 1, 4)).toBe("긴 휴식까지 3번 남았어요");
    expect(getCycleMessage(ko, "focus", 3, 4)).toBe("긴 휴식까지 1번 남았어요");
  });

  it("짧은 휴식 뒤 마지막 집중이면 다음 휴식이 긴 휴식", () => {
    expect(getCycleMessage(ko, "short-break", 3, 4)).toBe(
      "긴 휴식까지 1번 남았어요",
    );
  });

  it("긴 휴식 중", () => {
    expect(getCycleMessage(ko, "long-break", 4, 4)).toBe("긴 휴식 시간이에요");
  });

  it("주기를 완료 횟수 이하로 줄이면: 집중 중이면 이번 휴식이 긴 휴식", () => {
    expect(getCycleMessage(ko, "focus", 3, 2)).toBe(
      "이번 휴식은 긴 휴식이에요",
    );
  });

  it("주기를 완료 횟수 이하로 줄이면: 짧은 휴식 중이면 다음 집중 뒤 긴 휴식", () => {
    expect(getCycleMessage(ko, "short-break", 2, 2)).toBe(
      "긴 휴식까지 1번 남았어요",
    );
  });

  it("영어는 남은 횟수에 맞춰 단수·복수", () => {
    expect(getCycleMessage(en, "focus", 3, 4)).toBe(
      "1 more session until a long break",
    );
    expect(getCycleMessage(en, "focus", 1, 4)).toBe(
      "3 more sessions until a long break",
    );
  });
});

describe("상태 문구", () => {
  it("모드와 상태에 맞는 문구", () => {
    expect(getStatusMessage(ko, "focus", "idle")).toBe("집중할 준비가 됐나요?");
    expect(getStatusMessage(ko, "short-break", "running")).toBe(
      "까미랑 짧은 산책 중이에요",
    );
    expect(getStatusMessage(ko, "long-break", "paused")).toBe("잠시 멈췄어요");
    expect(getStatusMessage(en, "long-break", "idle")).toBe(
      "Time for a long walk with Kkami",
    );
  });
});
