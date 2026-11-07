import { describe, expect, it } from "vitest";
import { getCycleMessage } from "./labels";

describe("사이클 안내 문구", () => {
  it("집중 중에는 긴 휴식까지 남은 횟수", () => {
    expect(getCycleMessage("focus", 1, 4)).toBe("긴 휴식까지 3번 남았어요");
    expect(getCycleMessage("focus", 3, 4)).toBe("긴 휴식까지 1번 남았어요");
  });

  it("짧은 휴식 뒤 마지막 집중이면 다음 휴식이 긴 휴식", () => {
    expect(getCycleMessage("short-break", 3, 4)).toBe(
      "긴 휴식까지 1번 남았어요",
    );
  });

  it("긴 휴식 중", () => {
    expect(getCycleMessage("long-break", 4, 4)).toBe("긴 휴식 시간이에요");
  });

  it("주기를 완료 횟수 이하로 줄이면: 집중 중이면 이번 휴식이 긴 휴식", () => {
    expect(getCycleMessage("focus", 3, 2)).toBe("이번 휴식은 긴 휴식이에요");
  });

  it("주기를 완료 횟수 이하로 줄이면: 짧은 휴식 중이면 다음 집중 뒤 긴 휴식", () => {
    expect(getCycleMessage("short-break", 2, 2)).toBe(
      "긴 휴식까지 1번 남았어요",
    );
  });
});
