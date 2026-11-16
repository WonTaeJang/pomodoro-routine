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
import { TRIP } from "./walkTrip";

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
  const animations = new Map(
    [
      ...walkRml.matchAll(
        /<LinearAnimation name="([^"]+)" id="0:(\d+)" fps="(\d+)" duration="(\d+)"[^>]*>([\s\S]*?)<\/LinearAnimation>/g,
      ),
    ].map(([, name, id, fps, frames, body]) => [
      id,
      { name, fps: Number(fps), frames: Number(frames), body },
    ]),
  );
  const byName = (name: string) =>
    [...animations.values()].find((a) => a.name === name)!;
  const seconds = (a: { fps: number; frames: number }) => a.frames / a.fps;
  /** Animations a layer plays, in order. */
  const layer = (name: string) => {
    const markup = walkRml.match(
      new RegExp(
        `<StateMachineLayer name="${name}"[\\s\\S]*?</StateMachineLayer>`,
      ),
    )![0];
    return {
      markup,
      steps: [...markup.matchAll(/animationId="0:(\d+)"/g)].map(([, id]) =>
        animations.get(id)!,
      ),
    };
  };
  const xKeys = (body: string, objectId: number) =>
    [
      ...(
        body.match(
          new RegExp(
            `<KeyedObject objectId="0:${objectId}"><KeyedProperty property="x">([\\s\\S]*?)</KeyedProperty>`,
          ),
        )?.[1] ?? ""
      ).matchAll(/frame="(\d+)" value="(-?\d+)"/g),
    ].map(([, frame, value]) => [Number(frame), Number(value)]);
  const attr = (name: string, key: string) =>
    Number(
      walkRml.match(
        new RegExp(`<Node name="${name}" id="0:\\d+"[^>]*\\b${key}="(-?\\d+)"`),
      )?.[1],
    );

  it("한 번의 산책이 화면 타이머(TRIP)와 같은 길이로 진행", () => {
    const kkami = layer("Kkami");
    expect(kkami.steps.map((a) => a.name)).toEqual([
      "Prepare",
      "Start",
      "Walk out",
      "Pick up",
      "Walk home",
      "Arrive",
    ]);
    const [, start, out, pick, home, arrive] = kkami.steps;
    expect(start.frames).toBe(FRONT_FRAMES + TURN_FRAMES);
    expect(seconds(out) * 1000).toBe(TRIP.toSpot);
    expect(seconds(pick) * 1000).toBe(TRIP.pick);
    expect(seconds(home) * 1000).toBe(TRIP.toHome);
    expect(seconds(arrive) * 1000).toBe(TRIP.arrive);
    // sceneReady as the front pose shows; walkStarted with the first step,
    // where the page starts its own trip clock.
    for (const [step, trigger] of [
      [start, 42],
      [out, 43],
    ] as const) {
      const id = [...animations].find(([, a]) => a === step)![0];
      expect(kkami.markup).toMatch(
        new RegExp(
          `animationId="0:${id}" id="0:\\d+"><StateMachineFireTrigger viewModelPathIds="0:40-0:${trigger}"`,
        ),
      );
    }
  });

  it("각 단계는 자기 애니메이션이 끝날 때 다음으로 넘어감 (exitTime은 ms)", () => {
    const chained = [
      ...walkRml.matchAll(
        /animationId="0:(\d+)" id="0:\d+">(?:<StateMachineFireTrigger[^>]*\/>)?<StateTransition [^>]*exitTime="(\d+)"/g,
      ),
    ];
    expect(chained.length).toBeGreaterThan(0);
    for (const [, id, exitTime] of chained)
      expect(Number(exitTime)).toBe(
        Math.round(seconds(animations.get(id)!) * 1000),
      );
    // Every transition in the walk is one of these chained exits.
    expect(walkRml.match(/exitTime="/g)).toHaveLength(chained.length);
  });

  it("풍경은 출발 장면이 끝나야 움직이고, 길은 걷는 동안 한 칸씩·줍는 동안 멈춤", () => {
    const start = seconds(byName("Start"));
    for (const name of ["Outdoors", "Path", "Trees", "Clouds"]) {
      const [prepare, pause] = layer(name).steps;
      expect([prepare.name, pause.name]).toEqual(["Prepare", "Pause"]);
      expect(seconds(pause)).toBe(start);
    }
    expect(CELL * FPS).toBe(PATH_SPEED);
    for (const [name, fps] of [
      ["Path", FPS],
      ["Trees", FPS / 2],
    ] as const) {
      const [, , out, stop, home] = layer(name).steps;
      for (const moving of [out, home]) {
        const [[, from], [frames, to]] = xKeys(
          moving.body,
          name === "Path" ? 33 : 32,
        );
        expect(moving.fps).toBe(fps);
        expect((from - to) / frames).toBe(CELL);
      }
      expect(seconds(out) * 1000).toBe(TRIP.toSpot);
      expect(seconds(stop) * 1000).toBe(TRIP.pick);
      expect(xKeys(stop.body, name === "Path" ? 33 : 32)[0][1]).toBe(
        xKeys(out.body, name === "Path" ? 33 : 32).at(-1)![1],
      );
    }
  });

  it("바깥은 오른쪽에서 들어오고, 집에 도착하는 순간 왼쪽으로 빠짐", () => {
    const width = Number(walkRml.match(/<Artboard width="(\d+)"/)?.[1]);
    const height = Number(walkRml.match(/<Artboard[^>]*height="(\d+)"/)?.[1]);
    expect(height).toBeGreaterThanOrEqual(316); // covers the phone room at 1x
    expect(attr("Outdoors", "x")).toBe(width);
    const outdoors = layer("Outdoors").steps;
    expect(outdoors.map((a) => a.name)).toEqual([
      "Prepare",
      "Pause",
      "Go outside",
      "Outside",
      "Go inside",
    ]);
    const [, , goOut, , goIn] = outdoors;
    expect(xKeys(goOut.body, 35)).toEqual([
      [0, width],
      [goOut.frames, 0],
    ]);
    expect(xKeys(goIn.body, 35)).toEqual([
      [0, 0],
      [goIn.frames, -width],
    ]);
    expect((width / goOut.frames) % CELL).toBe(0);
    const until = (steps: { fps: number; frames: number }[], count: number) =>
      steps.slice(0, count).reduce((sum, a) => sum + seconds(a), 0);
    expect(until(outdoors, 4)).toBeCloseTo(until(layer("Kkami").steps, 5));
    expect(seconds(goIn)).toBeLessThanOrEqual(TRIP.arrive / 1000);
  });

  it("반짝이는 자리는 까미가 멈출 때 코끝에 옴", () => {
    const [, , out] = layer("Path").steps;
    const pathStop = xKeys(out.body, 33).at(-1)![1];
    const nose = attr("Kkami", "x") + 42 * CELL;
    expect(attr("Find", "x") + pathStop).toBe(nose);
  });
});

describe("산책 바깥 시간대", () => {
  const layer = walkRml.match(
    /<StateMachineLayer name="Sky"[\s\S]*?<\/StateMachineLayer>/,
  )![0];
  const flag = (name: string) =>
    walkRml.match(
      new RegExp(`<ViewModelPropertyBoolean name="${name}" id="0:(\\d+)"`),
    )![1];
  const goesTo = (markup: string) =>
    [
      ...markup.matchAll(
        /<StateTransition stateToId="0:(\d+)"[^>]*>(.*?)<\/StateTransition>|<StateTransition stateToId="0:(\d+)"\/>/g,
      ),
    ].map(([, to, condition, plain]) => ({
      to: to ?? plain,
      flag: condition?.match(/sourcePathIds="0:40-0:(\d+)"/)?.[1] ?? null,
    }));

  it("페이지가 새벽·해질녘·밤 값을 넘기고, 아무것도 아니면 낮", () => {
    for (const name of ["isDawn", "isDusk", "isNight"])
      expect(walkRml).toContain(
        `viewModelPropertyId="0:${flag(name)}" propertyValue="false"`,
      );
    const entry = layer.match(/<EntryState[^>]*>([\s\S]*?)<\/EntryState>/)![1];
    const choices = goesTo(entry);
    // Conditions first, the plain day transition last.
    expect(choices.map((c) => c.flag)).toEqual([
      flag("isDawn"),
      flag("isDusk"),
      flag("isNight"),
      null,
    ]);
  });

  it("시간대마다 그 하늘만 보이고 밤에는 구름을 숨김", () => {
    const sky = (time: string) =>
      walkRml.match(new RegExp(`<Node name="Sky ${time}" id="0:(\\d+)"`))![1];
    const clouds = walkRml.match(/<Node name="Clouds" id="0:(\d+)"/)![1];
    for (const time of ["day", "dawn", "dusk", "night"]) {
      const body = walkRml.match(
        new RegExp(
          `<LinearAnimation name="Sky ${time}"[^>]*>([\\s\\S]*?)</LinearAnimation>`,
        ),
      )![1];
      const opacity = (id: string) =>
        Number(
          body.match(
            new RegExp(
              `objectId="0:${id}"><KeyedProperty property="opacity"><KeyFrameDouble frame="0" value="(\\d)"`,
            ),
          )![1],
        );
      for (const other of ["day", "dawn", "dusk", "night"])
        expect(opacity(sky(other))).toBe(other === time ? 1 : 0);
      expect(opacity(clouds)).toBe(time === "night" ? 0 : 1);
    }
  });

  it("낮 상태에서도 늦게 넘어온 값을 따라감", () => {
    const day = walkRml.match(
      /<LinearAnimation name="Sky day" id="0:(\d+)"/,
    )![1];
    const state = layer.match(
      new RegExp(
        `animationId="0:${day}" id="0:\\d+">([\\s\\S]*?)</AnimationState>`,
      ),
    )![1];
    expect(goesTo(state).map((c) => c.flag)).toEqual([
      flag("isDawn"),
      flag("isDusk"),
      flag("isNight"),
    ]);
  });
});
