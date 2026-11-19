import { beforeEach, describe, expect, it, vi } from "vitest";

// localStorage를 메모리로 흉내 냄
vi.hoisted(() => {
  const data = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, String(value)),
    removeItem: (key) => void data.delete(key),
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
});

import { getCertificate } from "@/features/certificate/certificate";
import type { CompletedSession } from "@/features/timer/types";
import { STORAGE_KEYS } from "@/lib/storage";
import {
  clearStampsSeen,
  readStampsSeen,
  stampsEarned,
  writeStampsSeen,
} from "./stamps";

const MIN = 60_000;
const focus = (endedAt: number, cycleCompleted = false): CompletedSession => ({
  mode: "focus",
  endedAt,
  durationMs: 25 * MIN,
  ...(cycleCompleted ? { cycleCompleted: true } : {}),
});
const rest = (endedAt: number): CompletedSession => ({
  mode: "long-break",
  endedAt,
  durationMs: 15 * MIN,
});

describe("발바닥 도장 세기", () => {
  it("사이클을 마친 집중마다 하나 (수료증 수와 같음)", () => {
    const sessions = [
      focus(1),
      focus(2),
      focus(3),
      focus(4, true),
      rest(5),
      focus(6),
      focus(7, true),
      focus(8),
    ];
    expect(stampsEarned(sessions)).toBe(2);
    expect(getCertificate(sessions, [])?.number).toBe(2);
  });

  it("기록이 없거나 사이클을 못 마쳤으면 0", () => {
    expect(stampsEarned([])).toBe(0);
    expect(stampsEarned([focus(1), focus(2), rest(3)])).toBe(0);
  });
});

describe("확인한 도장 수 (빨간 점)", () => {
  beforeEach(() => localStorage.clear());

  it("저장하고 다시 읽음", () => {
    expect(readStampsSeen()).toBe(0);
    writeStampsSeen(3);
    expect(readStampsSeen()).toBe(3);
    clearStampsSeen();
    expect(readStampsSeen()).toBe(0);
  });

  it("이상한 값은 0으로", () => {
    localStorage.setItem(STORAGE_KEYS.stampsSeen, "abc");
    expect(readStampsSeen()).toBe(0);
    localStorage.setItem(STORAGE_KEYS.stampsSeen, "-2");
    expect(readStampsSeen()).toBe(0);
  });
});
