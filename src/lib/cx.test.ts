import { describe, expect, it } from "vitest";
import { cx } from "./cx";

describe("cx", () => {
  it("참인 클래스만 공백으로 이어 붙인다", () => {
    expect(cx("a", false, "b", null, undefined, "c")).toBe("a b c");
  });

  it("모두 거짓이면 빈 문자열을 돌려준다", () => {
    expect(cx(false, null)).toBe("");
  });
});
