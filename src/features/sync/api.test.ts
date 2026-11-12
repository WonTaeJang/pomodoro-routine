import { describe, expect, it, vi } from "vitest";
import { fetchAllPages, writeInChunks } from "./api";

describe("fetchAllPages", () => {
  it("1,000줄이 꽉 차면 다음 쪽을 받고, 덜 차면 멈춤", async () => {
    const rows = Array.from({ length: 1500 }, (_, i) => i);
    const page = vi.fn(async (from: number, to: number) => ({
      data: rows.slice(from, to + 1),
      error: null,
    }));
    expect(await fetchAllPages<number>(page)).toEqual(rows);
    expect(page.mock.calls).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });

  it("오류가 오면 던짐", async () => {
    const error = new Error("offline");
    await expect(
      fetchAllPages(async () => ({ data: null, error })),
    ).rejects.toBe(error);
  });
});

describe("writeInChunks", () => {
  it("200개씩 나눠 쓰고, 실패하면 거기서 멈춤", async () => {
    const write = vi.fn(async (part: number[]) => ({
      error: part[0] === 200 ? new Error("거절") : null,
    }));
    const items = Array.from({ length: 450 }, (_, i) => i);
    await expect(writeInChunks(items, write)).rejects.toThrow("거절");
    expect(write.mock.calls.map(([part]) => part.length)).toEqual([200, 200]);
  });

  it("쓸 것이 없으면 요청하지 않음", async () => {
    const write = vi.fn();
    await writeInChunks([], write);
    expect(write).not.toHaveBeenCalled();
  });
});
