import { describe, expect, it } from "vitest";
import { DEFAULT_LOOK, FURNITURE, SLOTS } from "./furniture";
import {
  POTS,
  ROOMS,
  TIME_STARTS,
  paintArt,
  patternUrl,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
  lookArt,
  msUntilNextTime,
  roomPicture,
  rugArt,
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

describe("벽·바닥·러그 도트", () => {
  it("벽·바닥 세트마다 반복 무늬와 바닥선 띠가 있음", () => {
    for (const look of FURNITURE.filter((p) => p.slot === "room").map(
      (p) => p.id,
    )) {
      const { wall, floor } = ROOMS[look as keyof typeof ROOMS];
      for (const { width, height, paint } of [wall.tile, floor.tile]) {
        // every cell of a tile is painted, so the pattern has no holes
        expect(cells(paintArt(width, height, paint)).size).toBe(width * height);
      }
      expect(wall.edge).toBeDefined();
      expect(floor.edge).toBeDefined();
    }
  });

  it("작은 그림은 바닥선 위아래로 벽과 바닥", () => {
    const art = roomPicture("cabinRoom");
    expect([art.width, art.height]).toEqual([16, 16]);
    const c = cells(art);
    expect(c.get("1,9")).toBe("#c4a67c"); // the panelling's bottom rail
    expect(c.get("0,10")).toBe("#a98660"); // the floor line
    expect(cells(roomPicture("stripeRoom")).get("1,0")).toBe("#f6efdc");
  });

  it("러그는 바닥에서 방 칸 크기로, 작은 그림은 더 작게", () => {
    for (const look of ["braidRug", "pinkRug", "fringeRug"] as const) {
      const floor = rugArt(look);
      const small = rugArt(look, "small");
      expect([floor.width, floor.height]).toEqual([45, 12]);
      expect(small.width).toBeLessThan(floor.width);
      expect(cells(small).size).toBeGreaterThan(0);
    }
  });

  it("CSS 배경 이미지는 SVG 데이터 주소", () => {
    const url = patternUrl(ROOMS.stripeRoom.wall.tile);
    expect(url.startsWith('url("data:image/svg+xml,')).toBe(true);
    expect(decodeURIComponent(url)).toContain('viewBox="0 0 12 1"');
  });
});
