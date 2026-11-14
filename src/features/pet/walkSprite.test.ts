import { readFileSync } from "node:fs";
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
} from "../../../scripts/walk-sprite.mjs";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");
const walkRml = read("../../assets/kkami-walk/scene.rml");
const petRml = read("../../assets/kkami-pet/scene.rml");

type Paw = { dx: number; lift: number };
type Cell = { x: number; y: number; color: string };

/** Visible cells of a node in its own coordinates (Rive draws its first child on top). */
function rasterize(rml: string, nodeName: string) {
  const start = rml.indexOf(`<Node name="${nodeName}"`);
  const tags = rml
    .slice(start)
    .matchAll(/<(\/?)(Node|Shape|Rectangle|SolidColor)\b([^>]*?)(\/?)>/g);
  const num = (attrs: string, name: string) =>
    Number(attrs.match(new RegExp(`\\b${name}="(-?[\\d.]+)"`))?.[1] ?? 0);
  const stack: { x: number; y: number; hidden: boolean }[] = [];
  const cells = new Map<string, string>();
  let shape: {
    x: number;
    y: number;
    rects: number[][];
    color?: string;
  } | null = null;
  for (const [, close, tag, attrs, selfClose] of tags) {
    const parent = stack.at(-1) ?? { x: 0, y: 0, hidden: false };
    if (tag === "Node" && !close) {
      const root = !stack.length;
      stack.push({
        x: root ? 0 : parent.x + num(attrs, "x"),
        y: root ? 0 : parent.y + num(attrs, "y"),
        hidden: parent.hidden || /\bopacity="0"/.test(attrs),
      });
      if (selfClose) stack.pop();
    } else if (tag === "Node") {
      stack.pop();
      if (!stack.length) break;
    } else if (tag === "Shape" && !close) {
      shape = { x: num(attrs, "x"), y: num(attrs, "y"), rects: [] };
    } else if (tag === "Rectangle" && shape) {
      shape.rects.push(["x", "y", "width", "height"].map((n) => num(attrs, n)));
    } else if (tag === "SolidColor" && shape) {
      shape.color = attrs.match(/colorValue="FF(\w{6})"/)?.[1];
    } else if (tag === "Shape" && close && shape) {
      if (!parent.hidden)
        for (const [rx, ry, w, h] of shape.rects) {
          const x0 = parent.x + shape.x + rx;
          const y0 = parent.y + shape.y + ry;
          for (let y = y0; y < y0 + h; y += CELL)
            for (let x = x0; x < x0 + w; x += CELL) {
              const key = `${x / CELL},${y / CELL}`;
              if (!cells.has(key)) cells.set(key, shape.color!);
            }
        }
      shape = null;
    }
  }
  return cells;
}

/** The markup of one node, including its children. */
function nodeMarkup(rml: string, name: string) {
  const start = rml.indexOf(`<Node name="${name}"`);
  let depth = 0;
  for (const match of rml.slice(start).matchAll(/<(\/?)Node\b[^>]*?(\/?)>/g)) {
    if (match[2]) continue;
    depth += match[1] ? -1 : 1;
    if (!depth) return rml.slice(start, start + match.index + match[0].length);
  }
  throw new Error(`Unclosed node ${name}`);
}

const numbers = (rml: string, pattern: RegExp) =>
  [...rml.matchAll(pattern)].map((match) => Number(match[1]));

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
      const paws: Paw[] = LEGS.map((leg) => pawAt(frame, leg.phase));
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
  it("시작 정면 자세가 집의 대기 까미와 칸 단위로 같음", () => {
    const home = rasterize(petRml, "Kkami");
    const front = new Map(
      (frontCells().cells as Cell[]).map(({ x, y, color }) => [
        `${x},${y}`,
        PALETTE[color as keyof typeof PALETTE],
      ]),
    );
    expect(front).toEqual(home);
  });

  it("까미는 집 팔레트 색만 쓰고 모든 좌표가 4단위 격자에 맞음", () => {
    const homeColors = new Set(rasterize(petRml, "Kkami").values());
    expect(new Set(Object.values(PALETTE))).toEqual(homeColors);
    const art = walkRml.slice(0, walkRml.indexOf("<StateMachine "));
    const kkami = nodeMarkup(art, "Kkami");
    const dogColors = new Set(
      [...kkami.matchAll(/colorValue="FF(\w{6})"/g)].map((match) => match[1]),
    );
    expect(dogColors).toEqual(homeColors);
    const geometry = numbers(art, /\b(?:x|y|width|height)="(-?[\d.]+)"/g);
    expect(geometry.length).toBeGreaterThan(0);
    geometry.forEach((value) => expect(Math.abs(value % CELL)).toBe(0));
    // Keyed positions step whole cells; opacity is either shown or hidden.
    const keyed = numbers(
      walkRml,
      /KeyFrameDouble frame="\d+" value="(-?[\d.]+)"/g,
    );
    keyed.forEach((value) =>
      expect(value % CELL === 0 || value === 1).toBe(true),
    );
  });
});

describe("산책 Rive 재생 계약", () => {
  const animation = (name: string) =>
    walkRml.match(
      new RegExp(`<LinearAnimation\\b[^>]*name="${name}"[^>]*>`),
    )?.[0] ?? "";
  const prop = (tag: string, name: string) =>
    Number(tag.match(new RegExp(`${name}="(\\d+)"`))?.[1]);

  it("걷기와 길이 같은 박자로 프레임 단위 이동", () => {
    const walking = animation("Walking");
    expect(prop(walking, "fps")).toBe(FPS);
    expect(prop(walking, "duration")).toBe(FRAMES);
    for (const [name, step] of [
      ["Path", CELL],
      ["Trees", CELL],
      ["Clouds", CELL],
    ] as const) {
      const tag = animation(name);
      const body = walkRml.slice(walkRml.indexOf(tag));
      const distance = -Number(
        body.match(/KeyFrameDouble frame="\d+" value="(-\d+)"/)?.[1],
      );
      expect(tag).toContain('quantize="true"');
      expect(distance / prop(tag, "duration")).toBe(step);
    }
    expect(CELL * prop(animation("Path"), "fps")).toBe(PATH_SPEED);
  });

  it("집 자세로 시작해 돌아선 뒤 걷고, 길은 걷기 시작과 함께 움직임", () => {
    expect(prop(animation("Start"), "duration")).toBe(
      FRONT_FRAMES + TURN_FRAMES,
    );
    expect(prop(animation("Pause"), "duration")).toBe(
      prop(animation("Start"), "duration"),
    );
    // sceneReady fires as the start begins; walkStarted as the first step begins.
    expect(walkRml).toMatch(
      /animationId="0:53" id="0:14"><StateMachineFireTrigger viewModelPathIds="0:40-0:42"/,
    );
    expect(walkRml).toMatch(
      /animationId="0:50" id="0:13"><StateMachineFireTrigger viewModelPathIds="0:40-0:43"/,
    );
    // Path, trees, clouds and the outdoors all wait out the start.
    expect(
      walkRml.match(/animationId="0:56" id="0:\d+"><StateTransition/g),
    ).toHaveLength(4);
  });

  it("방에서 출발하면 바깥이 오른쪽에서 칸 단위로 밀려 들어와 방을 덮음", () => {
    const width = Number(walkRml.match(/<Artboard width="(\d+)"/)?.[1]);
    const height = Number(walkRml.match(/<Artboard[^>]*height="(\d+)"/)?.[1]);
    // Covers the 316px phone room at 1x.
    expect(height).toBeGreaterThanOrEqual(316);
    const outdoors = walkRml.match(
      /<Node name="Outdoors" id="0:35" ([^>]*)>/,
    )?.[1];
    expect(outdoors).toContain(`x="${width}"`); // off to the right at first
    const enter = animation("Go outside");
    expect(enter).toContain('loopValue="oneShot"');
    expect(enter).toContain('quantize="true"');
    const body = walkRml.slice(walkRml.indexOf(enter));
    const keys = [
      ...body
        .slice(0, body.indexOf("</LinearAnimation>"))
        .matchAll(/KeyFrameDouble frame="(\d+)" value="(-?\d+)"/g),
    ].map(([, frame, value]) => [Number(frame), Number(value)]);
    expect(keys).toEqual([
      [0, width],
      [prop(enter, "duration"), 0],
    ]);
    expect((width / prop(enter, "duration")) % CELL).toBe(0);
    // It enters with the first step: after the same pause as the scenery.
    expect(walkRml).toMatch(
      /animationId="0:56" id="0:38"><StateTransition stateToId="0:39"/,
    );
    expect(walkRml).toContain('animationId="0:57" id="0:39"');
  });
});
