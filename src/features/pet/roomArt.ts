import type { LookId } from "./furniture";

// 방의 창문·화분 도트 그림. 집 까미와 같은 칸 크기로 그립니다(_room-art.scss의 --room-cell).
// 창은 창밖(하늘·해·달·언덕)을 먼저 그리고 창틀을 덮어, 어떤 창에도 시간대가 들어갑니다.

export type TimeOfDay = "dawn" | "day" | "dusk" | "night";
/** Starting hour of each time of day, on the device clock. */
export const TIME_STARTS: Record<TimeOfDay, number> = {
  dawn: 5,
  day: 7,
  dusk: 17,
  night: 19,
};

export function timeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= TIME_STARTS.night || hour < TIME_STARTS.dawn) return "night";
  if (hour >= TIME_STARTS.dusk) return "dusk";
  if (hour >= TIME_STARTS.day) return "day";
  return "dawn";
}

/** Milliseconds until the next time of day begins. */
export function msUntilNextTime(date: Date): number {
  const next = Object.values(TIME_STARTS)
    .map((hour) => {
      const at = new Date(date);
      at.setHours(hour, 0, 0, 0);
      if (at <= date) at.setDate(at.getDate() + 1);
      return at.getTime();
    })
    .reduce((a, b) => Math.min(a, b));
  return next - date.getTime();
}

/** One drawing: its size in cells and a path per color. */
export type PixelArt = {
  width: number;
  height: number;
  paths: [string, string][];
};

type Cells = Map<string, string>;
function toArt(cells: Cells, width: number, height: number): PixelArt {
  const byColor = new Map<string, string>();
  for (const [key, color] of cells) {
    const [x, y] = key.split(",");
    byColor.set(color, `${byColor.get(color) ?? ""}M${x} ${y}h1v1h-1z`);
  }
  return { width, height, paths: [...byColor] };
}

// --- Window -------------------------------------------------------------------
export const WINDOW_WIDTH = 15;
export const WINDOW_HEIGHT = 21;
// The glass: 9 x 13 cells, crossed by one bar each way.
const PANE = { x0: 3, x1: 11, y0: 3, y1: 15 };
const BAR = { x: 7, y: 9 };
const FRAME = 2;

const SKY: Record<TimeOfDay, { sky: string[]; hill: [string, string] }> = {
  dawn: {
    sky: ["#8e9ac2", "#b4acd2", "#dcb9c8", "#f3d2bd", "#f8e2c2"],
    hill: ["#93a99a", "#7f978a"],
  },
  day: {
    sky: ["#c4dbd7", "#c8ddd8", "#cbded8", "#cfe1d9", "#d4e4da"],
    hill: ["#b6cfb6", "#a3c1a4"],
  },
  dusk: {
    sky: ["#9d92c0", "#cf9ba6", "#eaa98a", "#f3c184", "#f7d89c"],
    hill: ["#8e9873", "#7a8562"],
  },
  night: {
    sky: ["#252e4b", "#2b3556", "#323d61", "#38446a", "#3f4b72"],
    hill: ["#2c4642", "#233936"],
  },
};
const HILL_TOP = [13, 13, 12, 12, 12, 13, 13, 12, 12]; // per pane column
const SHADOW = "#dfd5bf";
const CREAM = "#fdf9ed";
const TWIG = "#8a6239";

type WindowLook = Extract<
  LookId,
  "plainWindow" | "twigWindow" | "flowerWindow" | "stoneWindow"
>;

function inPane(look: WindowLook, x: number, y: number) {
  if (x < PANE.x0 || x > PANE.x1 || y < PANE.y0 || y > PANE.y1) return false;
  if (look !== "stoneWindow") return true;
  // Arched top: a half circle as wide as the glass.
  const r = (PANE.x1 - PANE.x0 + 1) / 2;
  const cy = PANE.y0 + r;
  if (y + 0.5 >= cy) return true;
  const dx = x + 0.5 - (PANE.x0 + r);
  const dy = cy - (y + 0.5);
  return dx * dx + dy * dy <= r * r;
}

const frameColor: Record<WindowLook, (x: number, y: number) => string> = {
  plainWindow: () => CREAM,
  flowerWindow: () => CREAM,
  twigWindow: (x, y) => ((x * 7 + y * 3) % 5 === 0 ? "#6b4a2a" : TWIG),
  stoneWindow: (x, y) =>
    ["#b9b5ad", "#cfcbc3", "#a8a49c"][
      (Math.floor(x / 2) + Math.floor((y + (Math.floor(y / 2) % 2)) / 2)) % 3
    ],
};
const barColor: Record<WindowLook, string> = {
  plainWindow: CREAM,
  flowerWindow: CREAM,
  twigWindow: TWIG,
  stoneWindow: TWIG,
};
/** Extra cells drawn over everything: twig ends, leaves, flowers, a keystone. */
const TRIM: Record<WindowLook, [number, number, string][]> = {
  plainWindow: [],
  twigWindow: [
    [0, 1, TWIG],
    [14, 1, TWIG],
    [0, 17, TWIG],
    [14, 17, TWIG],
    [3, 0, "#79a85f"],
    [4, 0, "#79a85f"],
    [5, 0, "#4f7a3f"],
    [0, 9, "#79a85f"],
    [0, 10, "#4f7a3f"],
    [12, 18, "#79a85f"],
    [13, 18, "#4f7a3f"],
    [14, 18, "#79a85f"],
  ],
  flowerWindow: [
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].flatMap(
      (x): [number, number, string][] => [
        [x, 18, "#c08a6a"],
        [x, 19, x % 4 === 0 ? "#8f5f45" : "#a6735a"],
        [x, 20, x % 4 === 0 ? "#8f5f45" : "#a6735a"],
      ],
    ),
    ...(
      [
        [2, "#e48aa0", "#f2c94c"],
        [5, "#f2c94c", "#e48aa0"],
        [9, "#e48aa0", "#f2c94c"],
        [12, "#f0a35e", "#f2c94c"],
      ] as const
    ).flatMap(([x, petal, middle]): [number, number, string][] => [
      [x, 15, petal],
      [x - 1, 16, petal],
      [x + 1, 16, petal],
      [x, 16, middle],
      [x, 17, "#6f9c5a"],
    ]),
  ],
  stoneWindow: [
    [7, 0, "#97938b"],
    [6, 1, "#97938b"],
    [7, 1, "#97938b"],
    [8, 1, "#97938b"],
  ],
};

export function windowArt(look: WindowLook, time: TimeOfDay): PixelArt {
  const cells: Cells = new Map();
  const set = (x: number, y: number, color: string) => {
    if (x >= 0 && y >= 0 && x < WINDOW_WIDTH && y < WINDOW_HEIGHT)
      cells.set(`${x},${y}`, color);
  };
  const glass = (x: number, y: number) => inPane(look, x, y);
  const nearGlass = (x: number, y: number) => {
    for (let dy = -FRAME; dy <= FRAME; dy++)
      for (let dx = -FRAME; dx <= FRAME; dx++)
        if (glass(x + dx, y + dy)) return true;
    return false;
  };
  const frame = (x: number, y: number) => !glass(x, y) && nearGlass(x, y);
  const solid = (x: number, y: number) => glass(x, y) || frame(x, y);
  const paint = (x: number, y: number, color: string) => {
    if (glass(x, y)) set(x, y, color);
  };

  for (let y = 0; y < WINDOW_HEIGHT; y++)
    for (let x = 0; x < WINDOW_WIDTH; x++)
      if (solid(x - 1, y - 1) && !solid(x, y)) set(x, y, SHADOW);

  const { sky, hill } = SKY[time];
  const rows = PANE.y1 - PANE.y0 + 1;
  for (let y = PANE.y0; y <= PANE.y1; y++)
    for (let x = PANE.x0; x <= PANE.x1; x++)
      paint(x, y, sky[Math.floor(((y - PANE.y0) / rows) * sky.length)]);

  if (time === "day") {
    for (let y = 4; y <= 6; y++)
      for (let x = 8; x <= 10; x++) paint(x, y, "#faf1c4");
    for (let i = 0; i < 3; i++) {
      paint(11, 5 + i, "#e2e7c6");
      paint(9 + i, 7, "#e2e7c6");
    }
  } else if (time === "dawn") {
    for (const x of [5, 6]) paint(x, 11, "#f6c27a");
    for (const x of [4, 5, 6, 8]) paint(x, 12, "#f6c27a");
    for (const [x, y] of [
      [9, 4],
      [10, 4],
      [10, 5],
    ])
      paint(x, y, "#e9e3f2");
  } else if (time === "dusk") {
    for (let y = 10; y <= 12; y++)
      for (let x = 8; x <= 10; x++) paint(x, y, y < 11 ? "#f6a65f" : "#ef8a52");
    for (let x = 8; x <= 11; x++) paint(x, 7, "#f4b8a0");
  } else {
    for (const [x, y] of [
      [9, 4],
      [10, 4],
      [8, 5],
      [9, 5],
      [8, 6],
      [9, 6],
      [9, 7],
      [10, 7],
    ])
      paint(x, y, "#f3e7b5");
    for (const [x, y] of [
      [4, 4],
      [5, 7],
      [10, 11],
      [4, 11],
    ])
      paint(x, y, "#fdf6d8");
  }
  HILL_TOP.forEach((top, i) => {
    const x = PANE.x0 + i;
    for (let y = top; y <= PANE.y1; y++)
      paint(x, y, hill[y === PANE.y1 ? 1 : 0]);
  });

  for (let y = 0; y < WINDOW_HEIGHT; y++)
    for (let x = 0; x < WINDOW_WIDTH; x++)
      if (frame(x, y)) set(x, y, frameColor[look](x, y));
  for (let y = PANE.y0; y <= PANE.y1; y++) paint(BAR.x, y, barColor[look]);
  for (let x = PANE.x0; x <= PANE.x1; x++) paint(x, BAR.y, barColor[look]);
  for (const [x, y, color] of TRIM[look]) set(x, y, color);
  return toArt(cells, WINDOW_WIDTH, WINDOW_HEIGHT);
}

// --- Pot ----------------------------------------------------------------------
type PotLook = Extract<
  LookId,
  "plainPot" | "flowerPot" | "pinePot" | "succulentPot"
>;
export const POTS: Record<
  PotLook,
  { rows: string[]; colors: Record<string, string> }
> = {
  plainPot: {
    rows: [
      "........aa..",
      ".......alla.",
      "......alll..",
      ".aa...sll...",
      "alll..s.....",
      "allll.s.....",
      ".llll.s.....",
      "...lss......",
      ".....s......",
      "..PPPPPPPpp.",
      "..PPPPPPDDp.",
      "..PPPPPPDD..",
      "..PPPPPPDD..",
      "..PPPPPPDD..",
      "..PPPPPPDD..",
      "..PPPPPPDD..",
    ],
    colors: {
      a: "#a7b492",
      l: "#95a380",
      s: "#849171",
      P: "#bb856e",
      p: "#cd9a80",
      D: "#ab755f",
    },
  },
  flowerPot: {
    rows: [
      ".#.....#....",
      "#y#...#y#.#.",
      ".#.....#.#y#",
      ".g..#..g..#.",
      ".g.#y#.g..g.",
      "..g.#.g..g..",
      "..g.g.g.g...",
      "...ggggg....",
      ".....g......",
      ".SSSSSSSSSS.",
      ".SoSSSSSSdd.",
      "..SSSSSSSd..",
      "..SSSSSSSd..",
      "..SSSSSSSd..",
      "...SSSSSd...",
      "...SSSSSd...",
    ],
    colors: {
      "#": "#e48aa0",
      y: "#f2c94c",
      g: "#6f9c5a",
      S: "#a8a49c",
      o: "#cfcbc3",
      d: "#8f8c86",
    },
  },
  pinePot: {
    rows: [
      ".....d......",
      "....ddd.....",
      "...dDDdd....",
      "....ddd.....",
      "...dDddd....",
      "..ddDdddd...",
      "...dddcd....",
      "..dDdddcd...",
      ".ddddDdddd..",
      ".....t......",
      ".WWWWWWWWWW.",
      ".WwWWWWWWbb.",
      "..WWWWWWWb..",
      "..WWWWWWWb..",
      "..WWWWWWWb..",
      "..WWWWWWWb..",
    ],
    colors: {
      d: "#4f7a55",
      D: "#6f9c5a",
      c: "#b07a45",
      t: "#6e4a2a",
      W: "#8a6239",
      w: "#a8794a",
      b: "#6b4a2a",
    },
  },
  succulentPot: {
    rows: [
      "............",
      "............",
      "............",
      "............",
      ".....k......",
      ".....G......",
      "..k.GgG.k...",
      "...GgGgG....",
      "k.GgGgGgG.k.",
      ".GgGgGgGgG..",
      "gGgGgGgGgGg.",
      ".SSSSSSSSSS.",
      ".SoSSSSSSdd.",
      ".SSSSSSSSSd.",
      "..SSSSSSSd..",
      "..SSSSSSSd..",
    ],
    colors: {
      g: "#7fa37c",
      G: "#b7cba3",
      k: "#e3a3a6",
      S: "#a8a49c",
      o: "#cfcbc3",
      d: "#8f8c86",
    },
  },
};

export function potArt(look: PotLook): PixelArt {
  const { rows, colors } = POTS[look];
  const cells: Cells = new Map();
  rows.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (colors[cell]) cells.set(`${x},${y}`, colors[cell]);
    }),
  );
  return toArt(cells, rows[0].length, rows.length);
}

const isWindowLook = (look: LookId): look is WindowLook =>
  look.endsWith("Window");

/** The drawing for any look, in any slot. */
export const lookArt = (look: LookId, time: TimeOfDay): PixelArt =>
  isWindowLook(look) ? windowArt(look, time) : potArt(look as PotLook);
