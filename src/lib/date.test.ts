import { describe, expect, it } from "vitest";
import {
  addDays,
  formatDate,
  formatDuration,
  formatLongDate,
  startOfDay,
} from "./date";

const MIN = 60_000;

describe("날짜", () => {
  it("그날 자정, n일 뒤, 표기", () => {
    const t = new Date(2026, 10, 30, 15, 20).getTime();
    expect(startOfDay(t)).toBe(new Date(2026, 10, 30).getTime());
    expect(addDays(startOfDay(t), 1)).toBe(new Date(2026, 11, 1).getTime());
    expect(formatDate(t)).toBe("2026.11.30");
    expect(formatLongDate(t)).toBe("11월 30일 월요일");
  });
});

describe("시간 길이 표기", () => {
  it("초, 분, 시간", () => {
    expect(formatDuration(5000)).toBe("5초");
    expect(formatDuration(25 * MIN)).toBe("25분");
    expect(formatDuration(100 * MIN)).toBe("1시간 40분");
    expect(formatDuration(120 * MIN)).toBe("2시간");
  });
});
