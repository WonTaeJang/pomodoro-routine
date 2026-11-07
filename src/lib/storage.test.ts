import { describe, expect, it } from "vitest";
import { migrateLegacyStorageScript, STORAGE_KEYS } from "./storage";

/** 시작 스크립트를 가짜 localStorage로 실행 */
function runWith(initial: Record<string, string>) {
  const data = new Map(Object.entries(initial));
  const localStorage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
  new Function("localStorage", migrateLegacyStorageScript)(localStorage);
  return Object.fromEntries(data);
}

describe("예전 저장 이름 옮기기", () => {
  it("예전 이름의 데이터를 새 이름으로 옮기고 예전 것은 지운다", () => {
    const result = runWith({
      "kkamidoro-tasks": '{"tasks":[1]}',
      "kkamidoro-theme": "dark",
    });
    expect(result).toEqual({
      [STORAGE_KEYS.tasks]: '{"tasks":[1]}',
      [STORAGE_KEYS.theme]: "dark",
    });
  });

  it("새 이름에 이미 데이터가 있으면 덮어쓰지 않는다", () => {
    const result = runWith({
      "kkamidoro-timer": "old",
      [STORAGE_KEYS.timer]: "new",
    });
    expect(result).toEqual({ [STORAGE_KEYS.timer]: "new" });
  });

  it("옮길 게 없으면 아무것도 바꾸지 않는다", () => {
    expect(runWith({ other: "x" })).toEqual({ other: "x" });
  });
});
