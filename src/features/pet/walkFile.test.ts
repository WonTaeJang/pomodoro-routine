import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  WALK_SRC,
  preloadWalk,
  preloadedWalk,
  resetPreloadedWalk,
} from "./walkFile";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("산책 장면 미리 받기", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    resetPreloadedWalk();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("한 번만 받고, 산책마다 따로 쓸 사본을 줌", async () => {
    fetchMock.mockResolvedValue(new Response(new Uint8Array([1, 2, 3])));
    expect(preloadedWalk()).toBeNull();
    preloadWalk();
    preloadWalk();
    await flush();
    preloadWalk();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(WALK_SRC);
    const first = preloadedWalk()!;
    const second = preloadedWalk()!;
    expect([...new Uint8Array(first)]).toEqual([1, 2, 3]);
    expect(first).not.toBe(second);
  });

  it("받기에 실패하면 비워 두고 다음에 다시 받음", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(new Response(new Uint8Array([7])));
    for (let attempt = 0; attempt < 2; attempt++) {
      preloadWalk();
      await flush();
      expect(preloadedWalk()).toBeNull();
    }
    preloadWalk();
    await flush();
    expect([...new Uint8Array(preloadedWalk()!)]).toEqual([7]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
