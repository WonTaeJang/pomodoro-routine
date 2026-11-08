import { describe, expect, it } from "vitest";
import {
  addDays,
  formatDate,
  formatDuration,
  formatLongDate,
  formatMonth,
  startOfDay,
  startOfMonth,
  weekdayNames,
} from "./date";

const MIN = 60_000;

describe("날짜", () => {
  it("그날 자정, n일 뒤", () => {
    const t = new Date(2026, 10, 30, 15, 20).getTime();
    expect(startOfDay(t)).toBe(new Date(2026, 10, 30).getTime());
    expect(addDays(startOfDay(t), 1)).toBe(new Date(2026, 11, 1).getTime());
    expect(startOfMonth(t)).toBe(new Date(2026, 10, 1).getTime());
  });

  it("언어별 표기", () => {
    const t = new Date(2026, 10, 30, 15, 20).getTime();
    expect(formatDate(t, "ko")).toBe("2026.11.30");
    expect(formatDate(t, "en")).toBe("Nov 30, 2026");
    expect(formatLongDate(t, "ko")).toBe("11월 30일 월요일");
    expect(formatLongDate(t, "en")).toBe("Monday, November 30");
    expect(formatMonth(2026, 10, "ko")).toBe("2026년 11월");
    expect(formatMonth(2026, 10, "en")).toBe("November 2026");
  });

  it("요일 이름은 일요일부터", () => {
    expect(weekdayNames("ko")).toEqual([
      "일",
      "월",
      "화",
      "수",
      "목",
      "금",
      "토",
    ]);
    expect(weekdayNames("en")[0]).toBe("Sun");
  });
});

describe("시간 길이 표기", () => {
  it("초, 분, 시간", () => {
    expect(formatDuration(5000, "ko")).toBe("5초");
    expect(formatDuration(25 * MIN, "ko")).toBe("25분");
    expect(formatDuration(100 * MIN, "ko")).toBe("1시간 40분");
    expect(formatDuration(120 * MIN, "ko")).toBe("2시간");
  });

  it("영어", () => {
    expect(formatDuration(5000, "en")).toBe("5 sec");
    expect(formatDuration(100 * MIN, "en")).toBe("1 hr 40 min");
  });
});
