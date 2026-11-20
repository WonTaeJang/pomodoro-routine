// 까미 옷(I-061): 까미와 같은 4단위 격자의 도트. 장면 좌표에서 계산한 뒤,
// 옷이 매달리는 노드(몸·머리, 서 있을 때·누웠을 때) 기준으로 돌려줍니다.

import { CELL as C } from "../pixel/scene";

/** [x, y, color] in scene units, one cell each. */
export type Cell = readonly [x: number, y: number, color: string];
/** [x, y, width, height, color] in scene units. */
export type RectSpec = readonly [
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
];

const FUR = "#414249"; // the neck seen through the cone's hole

// Where the scene puts Kkami, standing and lying down (scene units).
const ORIGIN = {
  dog: [180, 164],
  head: [180, 136], // the head node sits 28 above the dog
  resting: [180, 208],
  restingHead: [152, 200],
} as const;

type Legend = Record<string, string | ((i: number, j: number) => string)>;

/** Cells from character rows: one cell per character, "." left empty. */
function grid(
  x0: number,
  y0: number,
  rows: readonly string[],
  legend: Legend,
): Cell[] {
  const out: Cell[] = [];
  rows.forEach((row, j) =>
    [...row].forEach((ch, i) => {
      const paint = legend[ch];
      const color = typeof paint === "function" ? paint(i, j) : paint;
      if (color) out.push([x0 + i * C, y0 + j * C, color]);
    }),
  );
  return out;
}
/** Gingham: dark where a stripe crosses a stripe, mid on one, light between. */
const gingham =
  (dark: string, mid: string, light: string) => (i: number, j: number) =>
    i % 2 === 0 && j % 2 === 0
      ? dark
      : i % 2 === 0 || j % 2 === 0
        ? mid
        : light;

// --- Blue gingham bib with lace and a daisy (photo 4) -------------------------
const LACE = "#fbf8f1";
const bib = {
  upright: grid(
    152,
    180,
    [
      "l############l",
      "l############l",
      "l#####ww#####l",
      "l####wyyw####l",
      ".l###wyyw###l.",
      ".l####ww####l.",
      "..l########l..",
      "..ll######ll..",
      "...llllllll...",
      "...l.l..l.l...",
    ],
    {
      "#": gingham("#7f98d8", "#a9bde9", "#dfe7fa"),
      l: LACE,
      w: "#ffffff",
      y: "#f2c94c",
    },
  ),
  // Only the lace peeks out between the paws, under the chin.
  resting: grid(140, 232, ["lllll", "l.l.l"], { l: LACE }),
};

// --- Cream scarf tied with two strands (photo 7) ------------------------------
const SCARF: Record<string, string> = {
  c: "#f3e9cc",
  s: "#ddcba0",
  k: "#c8b084",
  f: "#e8dbb6",
};
const SCARF_LINE = "#a8916a";
function scarfStanding(): Cell[] {
  const X = 148;
  const Y = 180;
  const cells = new Map<string, string>();
  const set = (i: number, j: number, c: string) => cells.set(`${i},${j}`, c);
  for (let i = 0; i < 16; i++) set(i, 0, i % 3 === 2 ? "s" : "c"); // round the neck
  for (let i = 1; i < 15; i++) set(i, 1, "s");
  for (const [i, j] of [
    [6, 1],
    [7, 1],
    [6, 2],
    [7, 2],
  ])
    set(i, j, "k"); // the knot, a little left of the middle
  // The long strand falls straight; the short one leans out.
  for (let j = 3; j <= 12; j++) {
    set(6, j, "c");
    set(7, j, j % 4 === 0 ? "s" : "c");
    set(8, j, "s");
  }
  for (let j = 3; j <= 10; j++) {
    const o = Math.floor((j - 2) * 0.7);
    set(4 - o, j, "c");
    set(5 - o, j, "s");
  }
  for (const [i, j] of [
    [6, 13],
    [8, 13],
    [-1, 11],
    [1, 11],
  ])
    set(i, j, "f"); // frayed ends
  const fill: Cell[] = [...cells].map(([key, c]) => {
    const [i, j] = key.split(",").map(Number);
    return [X + i * C, Y + j * C, SCARF[c]];
  });
  // A line round the cloth (not above the band, not round the frayed ends).
  const line: Cell[] = [];
  for (const [key, c] of [...cells]) {
    if (c === "f") continue;
    const [i, j] = key.split(",").map(Number);
    for (const [di, dj] of [
      [1, 0],
      [-1, 0],
      [0, 1],
    ]) {
      const next = `${i + di},${j + dj}`;
      if (!cells.has(next) && j + dj > 1) {
        cells.set(next, "o");
        line.unshift([X + (i + di) * C, Y + (j + dj) * C, SCARF_LINE]);
      }
    }
  }
  return [...line, ...fill];
}
const scarf = {
  upright: scarfStanding(),
  // The strands show on the shoulder, just behind the resting head.
  resting: grid(
    200,
    188,
    ["occo", "occo", "ocso", "occo", "ocso.", "occso", "ocooso", "oc..oc"],
    { c: SCARF.c, s: SCARF.s, o: SCARF_LINE },
  ),
};

// --- Short blue check shirt (photo 15) ----------------------------------------
const NAVY = "#3f4f75";
const SHIRT_CHECK = gingham("#9fb8dc", "#c9d8ee", "#f4f7fb");
/** Every cell the body rectangles cover. */
function bodyCells(rects: readonly RectSpec[]) {
  const cells = new Set<string>();
  for (const [x0, y0, w, h] of rects)
    for (let y = y0; y < y0 + h; y += C)
      for (let x = x0; x < x0 + w; x += C) cells.add(`${x},${y}`);
  return cells;
}
/** The shirt covers the body a cell in from its outline, between two rows. */
function shirt(
  rects: readonly RectSpec[],
  {
    top,
    bottom,
    left = -Infinity,
  }: { top: number; bottom: number; left?: number },
  trim: (x: number, y: number) => string | null,
): Cell[] {
  const body = bodyCells(rects);
  const inside = (x: number, y: number) =>
    [
      [0, 0],
      [C, 0],
      [-C, 0],
      [0, C],
      [0, -C],
    ].every(([dx, dy]) => body.has(`${x + dx},${y + dy}`));
  const out: Cell[] = [];
  for (const key of body) {
    const [x, y] = key.split(",").map(Number);
    if (y < top || y > bottom || x < left || !inside(x, y)) continue;
    out.push([x, y, trim(x, y) ?? SHIRT_CHECK(x / C, y / C)]);
  }
  return out;
}
const shirtStanding = (rects: readonly RectSpec[]) =>
  shirt(rects, { top: 180, bottom: 208 }, (x, y) => {
    if (y === 180 || y === 208) return NAVY; // collar and hem
    if (x === 176 || x === 180)
      return y === 188 || y === 200 ? "#f4f7fb" : NAVY; // placket, buttons
    return null;
  });
const shirtResting = (rects: readonly RectSpec[]) =>
  shirt(rects, { top: 192, bottom: 224, left: 200 }, (x) =>
    x === 200 || x === 204 ? NAVY : null,
  );

// --- Cone collar (photo 39) ---------------------------------------------------
const CONE_BANDS = [
  "#4d5590",
  "#3c4270",
  "#5d66a8",
  "#3c4270",
  "#4d5590",
  "#2f3460",
];
function cone(cx: number, cy: number, rx: number, ry: number): Cell[] {
  const out: Cell[] = [];
  for (let y = cy - ry; y < cy + ry; y += C)
    for (let x = cx - rx; x < cx + rx; x += C) {
      const r = Math.hypot((x + 2 - cx) / rx, (y + 2 - cy) / ry);
      if (r > 1) continue;
      if (r < 0.32) out.push([x, y, FUR]);
      else
        out.push([
          x,
          y,
          CONE_BANDS[Math.min(5, Math.floor((r - 0.32) / 0.11))],
        ]);
    }
  return out;
}

// --- Brown hat with a wide brim (photo 23, everyone starts with it) -----------
const HAT = [
  "........oooooooo........",
  ".......ohhhhhhhho.......",
  ".......ohhdhhdhho.......",
  ".......ohhhhhhhho.......",
  ".......obbbbbbbbo.......",
  "..ooooohhhhhhhhhhooooo..",
  "ohhhhhhhhhhhhhhhhhhhhhho",
  ".oooooooooooooooooooooo.",
];
const HAT_COLORS = { o: "#6b4423", h: "#b97c40", d: "#a06632", b: "#5a3a1e" };

const shift = (cells: readonly Cell[], [ox, oy]: readonly [number, number]) =>
  cells.map(([x, y, c]): Cell => [x - ox, y - oy, c]);
const absolute = (
  rects: readonly RectSpec[],
  [ox, oy]: readonly [number, number],
) => rects.map(([x, y, w, h, c]): RectSpec => [x + ox, y + oy, w, h, c]);

export const WORN_LOOKS = [
  "brownHat",
  "ginghamBib",
  "creamScarf",
  "checkShirt",
  "coneCollar",
] as const;
export type WornLook = (typeof WORN_LOOKS)[number];

export type Outfit = {
  look: WornLook;
  /** The hat rides on the head; the rest sit on the body, under the head. */
  onHead: boolean;
  upright: Cell[];
  resting: Cell[];
};

/**
 * Every outfit, standing and lying down, as cells relative to its node.
 * `body` holds Kkami's own body rectangles (relative to the dog and the
 * resting dog), which the shirt follows.
 */
export function outfits(body: {
  standing: readonly RectSpec[];
  resting: readonly RectSpec[];
}): Outfit[] {
  const standing = absolute(body.standing, ORIGIN.dog);
  const lying = absolute(body.resting, ORIGIN.resting);
  const onBody = (
    look: WornLook,
    upright: Cell[],
    resting: Cell[],
  ): Outfit => ({
    look,
    onHead: false,
    upright: shift(upright, ORIGIN.dog),
    resting: shift(resting, ORIGIN.resting),
  });
  return [
    {
      look: "brownHat",
      onHead: true,
      upright: shift(grid(132, 60, HAT, HAT_COLORS), ORIGIN.head),
      resting: shift(grid(104, 136, HAT, HAT_COLORS), ORIGIN.restingHead),
    },
    onBody("ginghamBib", bib.upright, bib.resting),
    onBody("creamScarf", scarf.upright, scarf.resting),
    onBody("checkShirt", shirtStanding(standing), shirtResting(lying)),
    onBody("coneCollar", cone(180, 178, 84, 32), cone(154, 204, 72, 34)),
  ];
}

/** Runs of same-colored cells in a row, as rectangles. */
export function toRects(cells: readonly Cell[]): RectSpec[] {
  const rows = new Map<string, number[]>();
  for (const [x, y, c] of cells) {
    const key = `${y}:${c}`;
    const xs = rows.get(key);
    if (xs) xs.push(x);
    else rows.set(key, [x]);
  }
  const rects: RectSpec[] = [];
  for (const [key, xs] of rows) {
    const [y, c] = key.split(":");
    xs.sort((a, b) => a - b);
    let start = xs[0];
    let end = xs[0];
    for (const x of [...xs.slice(1), Infinity]) {
      if (x === end + C) end = x;
      else {
        rects.push([start, Number(y), end - start + C, C, c]);
        start = end = x;
      }
    }
  }
  return rects;
}

/** A small picture of a standing outfit: cells counted from its corner. */
export function picture(cells: readonly Cell[]) {
  const shown = cells.filter(([, , c]) => c !== FUR);
  const x0 = Math.min(...shown.map(([x]) => x));
  const y0 = Math.min(...shown.map(([, y]) => y));
  const width = (Math.max(...shown.map(([x]) => x)) - x0) / C + 1;
  const height = (Math.max(...shown.map(([, y]) => y)) - y0) / C + 1;
  return {
    width,
    height,
    cells: shown.map(([x, y, c]): Cell => [(x - x0) / C, (y - y0) / C, c]),
  };
}
