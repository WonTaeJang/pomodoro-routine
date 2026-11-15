import { describe, expect, it } from "vitest";
import { DEFAULT_LOOK, FURNITURE, SLOTS } from "./furniture";
import {
  POTS,
  TIME_STARTS,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
  lookArt,
  msUntilNextTime,
  timeOfDay,
  windowArt,
  type TimeOfDay,
} from "./roomArt";

const at = (hour: number, minute = 0) => new Date(2026, 10, 15, hour, minute);
const TIMES = Object.keys(TIME_STARTS) as TimeOfDay[];
const cells = (art: ReturnType<typeof windowArt>) =>
  new Map(
    art.paths.flatMap(([color, d]) =>
      [...d.matchAll(/M(\d+) (\d+)/g)].map(
        ([, x, y]) => [`${x},${y}`, color] as const,
      ),
    ),
  );

describe("창밖 시간대", () => {
  it("기기 시계로 새벽·낮·해질녘·밤을 나눔", () => {
    expect(timeOfDay(at(4, 59))).toBe("night");
    expect(timeOfDay(at(5))).toBe("dawn");
    expect(timeOfDay(at(6, 59))).toBe("dawn");
    expect(timeOfDay(at(7))).toBe("day");
    expect(timeOfDay(at(16, 59))).toBe("day");
    expect(timeOfDay(at(17))).toBe("dusk");
    expect(timeOfDay(at(19))).toBe("night");
    expect(timeOfDay(at(0))).toBe("night");
  });

  it("다음 시간대가 시작될 때까지 남은 시간", () => {
    expect(msUntilNextTime(at(6, 30))).toBe(30 * 60_000);
    expect(msUntilNextTime(at(19))).toBe(10 * 3_600_000);
    expect(msUntilNextTime(at(23, 30))).toBe(5.5 * 3_600_000);
  });

  it("창틀은 그대로, 창밖만 시간대마다 다름", () => {
    for (const look of FURNITURE.filter((p) => p.slot === "window")
      .map((p) => p.id as string)
      .concat(DEFAULT_LOOK.window)) {
      const drawings = TIMES.map((time) => cells(lookArt(look as never, time)));
      const keys = drawings.map((d) => [...d.keys()].sort().join());
      expect(new Set(keys).size).toBe(1); // same outline
      expect(
        new Set(drawings.map((d) => [...d.values()].sort().join())).size,
      ).toBe(TIMES.length);
    }
  });
});

describe("창문·화분 도트", () => {
  it("모든 모양을 그림 크기 안에 그림", () => {
    for (const slot of SLOTS)
      for (const look of [
        DEFAULT_LOOK[slot],
        ...FURNITURE.filter((p) => p.slot === slot).map((p) => p.id),
      ])
        for (const time of TIMES) {
          const art = lookArt(look, time);
          for (const key of cells(art).keys()) {
            const [x, y] = key.split(",").map(Number);
            expect(x).toBeLessThan(art.width);
            expect(y).toBeLessThan(art.height);
          }
        }
    expect([WINDOW_WIDTH, WINDOW_HEIGHT]).toEqual([15, 21]);
  });

  it("화분은 모두 같은 크기이고 정해진 색만 씀", () => {
    for (const { rows, colors } of Object.values(POTS)) {
      expect(rows).toHaveLength(16);
      rows.forEach((row) => expect(row).toHaveLength(12));
      for (const cell of rows.join(""))
        if (cell !== ".") expect(colors).toHaveProperty(cell);
    }
  });
});
