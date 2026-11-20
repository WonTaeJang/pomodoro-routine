import { describe, expect, it } from "vitest";
import {
  CELL,
  FPS,
  FRAMES,
  PATH_SPEED,
  FRONT_FRAMES,
  TURN_FRAMES,
  LEGS,
  PALETTE,
  pawAt,
  poseAt,
  frontCells,
  type Paw,
} from "./sprites/walkSprite";
import {
  WALK_HEIGHT,
  WALK_LAYERS,
  WALK_SCENE,
  WALK_STEP_MS,
  WALK_WIDTH,
  walkPose,
} from "./sprites/walkScene";
import { HOME_SCENE } from "./sprites/homeScene";
import type { Scene, SceneItem, SceneNode } from "./pixel/scene";
import { rasterize } from "./pixel/render";
import { clipMs, sample, type Clip } from "./pixel/timeline";
import { TRIP, TRIP_MS } from "./walkTrip";

const find = (items: readonly SceneItem[], id: string): SceneNode | null => {
  for (const item of items) {
    if (item.kind !== "node") continue;
    if (item.id === id) return item;
    const inside = find(item.children, id);
    if (inside) return inside;
  }
  return null;
};
/** One node alone, drawn at the origin. */
const alone = (scene: Scene, id: string): Scene => ({
  ...scene,
  items: [{ ...find(scene.items, id)!, x: 0, y: 0 }],
});
const rects = (items: readonly SceneItem[]): SceneItem[] =>
  items.flatMap((item) =>
    item.kind === "rect" ? [item] : [item, ...rects(item.children)],
  );
const seconds = (clip: Clip) => clip.frames / clip.fps;
const xKeys = (clip: Clip, node: string) =>
  clip.tracks.find((t) => t.node === node && t.prop === "x")!.keys;

describe("산책 발 디딤", () => {
  it("디딘 발은 프레임마다 한 칸씩 뒤로 가서 길과 같은 속도로 움직임", () => {
    expect(PATH_SPEED / FPS).toBe(CELL);
    for (const leg of LEGS) {
      for (let frame = 0; frame < FRAMES; frame++) {
        const now: Paw = pawAt(frame, leg.phase);
        const next: Paw = pawAt(frame + 1, leg.phase);
        if (now.lift === 0 && next.lift === 0)
          expect(next.dx - now.dx).toBe(-1);
      }
      expect(pawAt(FRAMES, leg.phase)).toEqual(pawAt(0, leg.phase));
    }
  });

  it("매 프레임 두 발 이상 지지하고 대각선 다리가 함께 움직임", () => {
    for (let frame = 0; frame < FRAMES; frame++) {
      const paws = LEGS.map((leg) => pawAt(frame, leg.phase));
      expect(
        paws.filter((paw) => paw.lift === 0).length,
      ).toBeGreaterThanOrEqual(2);
      paws.forEach((paw) => expect(paw.lift).toBeGreaterThanOrEqual(0));
    }
    const phase = (name: string) =>
      LEGS.find((leg) => leg.name === name)!.phase;
    expect(phase("Near front")).toBe(phase("Far hind"));
    expect(phase("Near hind")).toBe(phase("Far front"));
  });

  it("귀는 몸이 오르내릴 때 한 칸 늦게 따라와 출렁임", () => {
    for (let frame = 0; frame < FRAMES; frame++) {
      const { bob, ear } = poseAt(frame);
      const previous = poseAt((frame + FRAMES - 1) % FRAMES).bob;
      // Body up (negative y): ear stays low; body down: ear stays high.
      expect(ear).toBe(Math.sign(previous - bob));
    }
  });
});

describe("산책 그림이 집 화면과 같은 도트", () => {
  const home = rasterize(alone(HOME_SCENE, "dog"));

  it("시작 정면 자세가 집의 대기 까미와 칸 단위로 같음", () => {
    const front = new Map(
      frontCells().cells.map(({ x, y, color }) => [
        `${x},${y}`,
        `#${PALETTE[color].toLowerCase()}`,
      ]),
    );
    expect(front).toEqual(home);
  });

  it("까미는 집 팔레트 색만 쓰고 모든 좌표가 4단위 격자에 맞음", () => {
    const homeColors = new Set(home.values());
    expect(
      new Set(Object.values(PALETTE).map((c) => `#${c.toLowerCase()}`)),
    ).toEqual(homeColors);
    const dog = find(WALK_SCENE.items, "dog")!;
    const parts = rects(dog.children);
    expect(
      new Set(parts.flatMap((p) => (p.kind === "rect" ? [p.color] : []))),
    ).toEqual(homeColors);
    const geometry = rects(WALK_SCENE.items).flatMap((p) =>
      p.kind === "rect" ? [p.x, p.y, p.width, p.height] : [p.x, p.y],
    );
    geometry.forEach((value) => expect(Math.abs(value % CELL)).toBe(0));
    // Keyed positions step whole cells on every frame; opacity is shown or hidden.
    for (const layer of Object.values(WALK_LAYERS))
      for (const clip of layer)
        for (const track of clip.tracks)
          for (let frame = 0; frame <= clip.frames; frame++) {
            const value = sample(track, frame);
            if (track.prop === "opacity") expect([0, 1]).toContain(value);
            else expect(Math.abs(value % CELL)).toBe(0);
          }
  });
});

describe("산책 재생", () => {
  it("한 번의 산책이 화면 타이머(TRIP)와 같은 길이로 진행", () => {
    const [start, out, pick, home, arrive] = WALK_LAYERS.kkami;
    expect(start.frames).toBe(FRONT_FRAMES + TURN_FRAMES);
    expect(seconds(out) * 1000).toBe(TRIP.toSpot);
    expect(seconds(pick) * 1000).toBe(TRIP.pick);
    expect(seconds(home) * 1000).toBe(TRIP.toHome);
    expect(seconds(arrive) * 1000).toBe(TRIP.arrive);
    // The page starts its trip clock with the first step.
    expect(WALK_STEP_MS).toBe(clipMs(start));
    const walk = WALK_LAYERS.kkami.reduce((sum, c) => sum + clipMs(c), 0);
    expect(walk - WALK_STEP_MS).toBe(TRIP_MS);
  });

  it("풍경은 출발 장면이 끝나야 움직이고, 길은 걷는 동안 한 칸씩·줍는 동안 멈춤", () => {
    const start = clipMs(WALK_LAYERS.kkami[0]);
    for (const layer of ["outdoors", "path", "trees", "clouds"] as const) {
      const [pause] = WALK_LAYERS[layer];
      expect(pause.tracks).toEqual([]);
      expect(clipMs(pause)).toBe(start);
    }
    expect(CELL * FPS).toBe(PATH_SPEED);
    for (const [layer, fps] of [
      ["path", FPS],
      ["trees", FPS / 2],
    ] as const) {
      const [, out, stop, home] = WALK_LAYERS[layer];
      for (const moving of [out, home]) {
        const [[, from], [frames, to]] = xKeys(moving, layer);
        expect(moving.fps).toBe(fps);
        expect((from - to) / frames).toBe(CELL);
      }
      expect(seconds(out) * 1000).toBe(TRIP.toSpot);
      expect(seconds(stop) * 1000).toBe(TRIP.pick);
      expect(xKeys(stop, layer)[0][1]).toBe(xKeys(out, layer).at(-1)![1]);
    }
  });

  it("바깥은 오른쪽에서 들어오고, 집에 도착하는 순간 왼쪽으로 빠짐", () => {
    expect(WALK_HEIGHT).toBeGreaterThanOrEqual(316); // covers the phone room at 1x
    expect(find(WALK_SCENE.items, "outdoors")!.x).toBe(WALK_WIDTH);
    const [, goOut, , goIn] = WALK_LAYERS.outdoors;
    expect(xKeys(goOut, "outdoors")).toEqual([
      [0, WALK_WIDTH],
      [goOut.frames, 0],
    ]);
    expect(xKeys(goIn, "outdoors")).toEqual([
      [0, 0],
      [goIn.frames, -WALK_WIDTH],
    ]);
    expect((WALK_WIDTH / goOut.frames) % CELL).toBe(0);
    const until = (clips: Clip[], count: number) =>
      clips.slice(0, count).reduce((sum, c) => sum + clipMs(c), 0);
    expect(until(WALK_LAYERS.outdoors, 3)).toBe(until(WALK_LAYERS.kkami, 4));
    expect(seconds(goIn)).toBeLessThanOrEqual(TRIP.arrive / 1000);
  });

  it("반짝이는 자리는 까미가 멈출 때 코끝에 옴", () => {
    const [, out] = WALK_LAYERS.path;
    const pathStop = xKeys(out, "path").at(-1)![1];
    const nose = find(WALK_SCENE.items, "dog")!.x + 42 * CELL;
    expect(find(WALK_SCENE.items, "find")!.x + pathStop).toBe(nose);
  });
});

describe("산책 바깥 시간대", () => {
  it("시간대마다 그 하늘만 보이고 밤에는 구름을 숨김", () => {
    const times = ["day", "dawn", "dusk", "night"] as const;
    for (const time of times) {
      const pose = walkPose(0, time);
      for (const other of times) {
        expect(pose.get(`sky:${other}`)?.opacity).toBe(other === time ? 1 : 0);
        expect(pose.get(`trees:${other}`)?.opacity).toBe(
          other === time ? 1 : 0,
        );
      }
      expect(pose.get("clouds")?.opacity).toBe(time === "night" ? 0 : 1);
    }
  });
});
