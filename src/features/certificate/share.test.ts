import { afterEach, describe, expect, it, vi } from "vitest";

/** 결과를 한 번만 계산해 두므로 테스트마다 모듈을 새로 불러옴 */
async function loadShare() {
  vi.resetModules();
  return import("./share");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("canShareImages", () => {
  it("이미지가 없어도 PNG 파일 종류로 공유 가능 여부를 미리 알아냄", async () => {
    const canShare = vi.fn((data: ShareData) =>
      Boolean(data.files?.every((file) => file.type === "image/png")),
    );
    vi.stubGlobal("navigator", { canShare });
    const { canShareImages } = await loadShare();

    expect(canShareImages()).toBe(true);
    expect(canShareImages()).toBe(true);
    // 한 번만 확인하고 그 뒤로는 기억해 둔 값을 씀
    expect(canShare).toHaveBeenCalledTimes(1);
  });

  it("공유 기능이 없는 브라우저(대부분의 PC)에서는 false", async () => {
    vi.stubGlobal("navigator", {});
    const { canShareImages } = await loadShare();
    expect(canShareImages()).toBe(false);
  });
});
