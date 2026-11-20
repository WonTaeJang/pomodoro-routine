import { describe, expect, it, vi } from "vitest";
import { node, nodeIds, rect, type Scene } from "./scene";
import {
  applyClip,
  applySequence,
  clip,
  clipMs,
  frameAt,
  keys,
  lastChange,
  sample,
  sequenceFrame,
  sequenceStarts,
  override,
  showOnly,
  type Pose,
} from "./timeline";
import {
  machinePose,
  startMachine,
  stepMachine,
  type MachineDef,
} from "./machine";
import { drawScene, rasterize } from "./render";

describe("키프레임", () => {
  const [hold] = keys("a", {
    y: [
      [4, 8],
      [0, 0],
      [8, 4],
    ],
  });
  const [line] = keys(
    "a",
    {
      x: [
        [0, 0],
        [4, 16],
      ],
    },
    "linear",
  );

  it("키는 다음 키까지 유지하고, 첫 키 전엔 첫 값·끝 키 뒤엔 끝 값", () => {
    expect(hold.keys.map(([f]) => f)).toEqual([0, 4, 8]); // sorted
    expect([0, 3, 4, 7, 8, 20].map((f) => sample(hold, f))).toEqual([
      0, 0, 8, 8, 4, 4,
    ]);
  });

  it("직선 키는 프레임마다 같은 만큼 움직임", () => {
    expect([0, 1, 2, 3, 4, 9].map((f) => sample(line, f))).toEqual([
      0, 4, 8, 12, 16, 16,
    ]);
  });

  it("시간을 프레임으로: 반복은 처음으로, 한 번은 끝에서 멈춤", () => {
    const looped = clip({ fps: 12, frames: 24, loop: true });
    const once = clip({ fps: 20, frames: 36 });
    expect(frameAt(looped, 0)).toBe(0);
    expect(frameAt(looped, 83)).toBe(0);
    expect(frameAt(looped, 84)).toBe(1);
    expect(frameAt(looped, 2000)).toBe(0);
    expect(frameAt(once, 3000)).toBe(36);
    expect(frameAt(clip({ fps: 12, frames: 36 }), 3000)).toBe(36); // not 35.999…
    expect(clipMs(once)).toBe(1800);
    expect(clipMs(clip({ fps: 12, frames: 8 }))).toBe(667);
  });

  it("동작은 자기가 정한 값만 바꿈", () => {
    const pose: Pose = new Map([["b", { x: 3 }]]);
    applyClip(pose, clip({ fps: 12, frames: 8 }, hold), 5);
    expect([...pose]).toEqual([
      ["b", { x: 3 }],
      ["a", { y: 8 }],
    ]);
  });

  it("이어 붙인 동작: 앞 동작의 마지막 값이 남고, 끝나면 마지막 프레임에 멈춤", () => {
    const first = clip(
      { fps: 10, frames: 10 },
      keys("a", {
        x: [
          [0, 1],
          [10, 2],
        ],
      }),
    );
    const second = clip({ fps: 10, frames: 5 }, keys("b", { x: [[0, 7]] }));
    const sequence = [first, second];
    expect(sequenceStarts(sequence)).toEqual([0, 1000]);
    const pose = applySequence(new Map(), sequence, 1200);
    expect(pose.get("a")).toEqual({ x: 2 });
    expect(pose.get("b")).toEqual({ x: 7 });
    // Named by the last change: frames that look the same share a name.
    expect(sequenceFrame(sequence, 500)).toBe("0:0");
    expect(sequenceFrame(sequence, 999)).toBe("0:0");
    expect(sequenceFrame(sequence, 1200)).toBe("1:0");
    expect(sequenceFrame(sequence, 9999)).toBe("1:0");
  });

  it("그림이 바뀌는 프레임만 셈: 유지 키는 키 프레임, 직선 키는 매 프레임", () => {
    const walk = clip(
      { fps: 12, frames: 12 },
      hold,
      keys(
        "b",
        {
          x: [
            [2, 0],
            [5, 3],
          ],
        },
        "linear",
      ),
    );
    expect(walk.changes).toEqual([0, 2, 3, 4, 5, 8]);
    expect([0, 1, 2, 6, 7, 8, 11].map((f) => lastChange(walk, f))).toEqual([
      0, 0, 2, 5, 5, 8, 8,
    ]);
    expect(lastChange(clip({ fps: 12, frames: 4 }), 3)).toBe(0);
  });

  it("한 묶음에서 하나만 보이게, 아무것도 아니면 모두 숨김", () => {
    expect(showOnly(["a", "b"], "b")).toEqual([
      ["a", { opacity: 0 }],
      ["b", { opacity: 1 }],
    ]);
    const pose = override(new Map(), showOnly(["a", "b"], null));
    expect([...pose.values()]).toEqual([{ opacity: 0 }, { opacity: 0 }]);
  });

  it("잘못된 길이의 동작은 만들지 않음", () => {
    expect(() => clip({ fps: 12, frames: 0 })).toThrow();
    expect(() => clip({ fps: 0, frames: 4 })).toThrow();
  });
});

describe("상태 머신", () => {
  type S = "rest" | "wave" | "bow";
  const def: MachineDef<S, "waving", "bow"> = {
    initial: "rest",
    states: {
      rest: {
        clip: clip(
          { fps: 10, frames: 10, loop: true },
          keys("a", { x: [[0, 1]] }),
        ),
        transitions: [
          { to: "wave", when: (i) => i.waving },
          { to: "bow", trigger: "bow" },
        ],
      },
      wave: {
        clip: clip(
          { fps: 10, frames: 10, loop: true },
          keys("a", { y: [[0, 5]] }),
        ),
        transitions: [{ to: "rest", when: (i) => !i.waving }],
      },
      bow: {
        clip: clip({ fps: 10, frames: 5 }, keys("a", { x: [[0, 9]] })),
        transitions: [{ to: "rest", atEnd: true }],
      },
    },
  };

  it("값이 바뀌면 넘어가고, 앞 상태가 남긴 값은 이어짐", () => {
    let run = startMachine(def);
    run = stepMachine(def, run, 50, { waving: true });
    expect(run).toMatchObject({ state: "wave", elapsed: 0 });
    // x set by rest stays while wave sets only y.
    expect(machinePose(def, run).get("a")).toEqual({ x: 1, y: 5 });
    run = stepMachine(def, run, 50, { waving: false });
    expect(run.state).toBe("rest");
  });

  it("신호는 그 걸음에서 쓰이고, 끝나는 동작은 남은 시간을 넘겨줌", () => {
    let run = startMachine(def);
    run = stepMachine(
      def,
      run,
      0,
      { waving: false },
      new Set(["bow"] as const),
    );
    expect(run.state).toBe("bow");
    run = stepMachine(def, run, 650, { waving: false });
    expect(run).toMatchObject({ state: "rest", elapsed: 150 });
    // A trigger the state does not listen to is dropped.
    run = stepMachine(def, run, 0, { waving: true }, new Set(["bow"] as const));
    expect(run.state).toBe("wave");
    run = stepMachine(def, run, 0, { waving: false });
    expect(run.state).toBe("rest");
  });

  it("서로 어긋난 값에도 멈추지 않음", () => {
    const flip: MachineDef<"a" | "b", "on"> = {
      initial: "a",
      states: {
        a: {
          clip: clip({ fps: 1, frames: 1, loop: true }),
          transitions: [{ to: "b", when: (i) => i.on }],
        },
        b: {
          clip: clip({ fps: 1, frames: 1, loop: true }),
          transitions: [{ to: "a", when: (i) => i.on }],
        },
      },
    };
    expect(() =>
      stepMachine(flip, startMachine(flip), 16, { on: true }),
    ).not.toThrow();
  });
});

describe("그리기", () => {
  const scene: Scene = {
    width: 20,
    height: 12,
    items: [
      node(
        "box",
        [
          rect(0, 0, 8, 4, "112233"),
          node("eye", [rect(4, 4, 4, 4, "#AABBCC")]),
        ],
        {
          x: 4,
          y: 4,
        },
      ),
      node("hidden", [rect(0, 0, 4, 4, "ffffff")], { opacity: 0 }),
    ],
  };

  it("칸 가운데를 덮는 색, 뒤에 그린 것이 위", () => {
    const cells = rasterize(scene);
    expect(cells.get("1,1")).toBe("#112233");
    expect(cells.get("2,2")).toBe("#aabbcc");
    expect(cells.has("0,0")).toBe(false); // the hidden node
    const moved = rasterize(scene, new Map([["box", { x: 0, y: 0 }]]));
    expect(moved.get("0,0")).toBe("#112233");
    // Squashed to a fifth around the node's origin: half a cell, no dot left.
    expect(
      rasterize(scene, new Map([["eye", { scaleY: 0.2 }]])).get("2,2"),
    ).toBeUndefined();
  });

  it("아이디는 겹치지 않음", () => {
    expect(nodeIds(scene)).toEqual(new Set(["box", "eye", "hidden"]));
    const twice: Scene = { ...scene, items: [...scene.items, node("box", [])] };
    expect(() => nodeIds(twice)).toThrow("box");
  });

  it("모서리를 기기 픽셀에 맞춰 칠해 칸 사이에 틈이 없음", () => {
    const fills: number[][] = [];
    const ctx = {
      canvas: { width: 24, height: 15 },
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: (...args: number[]) => fills.push(args),
      fillStyle: "",
      globalAlpha: 1,
      imageSmoothingEnabled: true,
    };
    const row: Scene = {
      width: 20,
      height: 12,
      items: [
        rect(0, 0, 4, 4, "000000"),
        rect(4, 0, 4, 4, "111111"),
        rect(8, 0, 4, 4, "222222"),
      ],
    };
    drawScene(ctx as unknown as CanvasRenderingContext2D, row, new Map(), 1.2);
    // 4.8 px per cell: edges at 0, 5, 10, 14 — each starts where the last ends.
    expect(fills.map(([x, , w]) => [x, x + w])).toEqual([
      [0, 5],
      [5, 10],
      [10, 14],
    ]);
    expect(ctx.imageSmoothingEnabled).toBe(false);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 24, 15);
  });
});
