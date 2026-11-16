import type { LookId } from "./furniture";

// 방의 창문·화분·벽과 바닥·러그 도트 그림. 집 까미와 같은 칸 크기로 그립니다(_room-art.scss의 --room-cell).
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

/** A color for each cell, or null to leave it empty. */
type Paint = (x: number, y: number) => string | null;

/** A drawing from a color for each cell. */
export function paintArt(width: number, height: number, paint: Paint) {
  const cells: Cells = new Map();
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const color = paint(x, y);
      if (color) cells.set(`${x},${y}`, color);
    }
  return toArt(cells, width, height);
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
  return paintArt(
    rows[0].length,
    rows.length,
    (x, y) => colors[rows[y][x]] ?? null,
  );
}

// --- Walls and floor -------------------------------------------------------------
// 벽과 바닥은 방 크기를 모르니 반복 무늬(tile)로 그리고, 벽 아래 띠·바닥 첫 줄(edge)을 덧댑니다.
type RoomLook = Extract<
  LookId,
  "plainRoom" | "cabinRoom" | "floralRoom" | "stripeRoom"
>;
/** A pattern to repeat: its size in cells and a color for each cell. */
export type Pattern = { width: number; height: number; paint: Paint };
/** A repeating pattern, plus an optional strip along the floor line. */
export type Surface = { tile: Pattern; edge?: Pattern };
export type RoomSurfaces = { wall: Surface; floor: Surface };

const pattern = (width: number, height: number, paint: Paint): Pattern => ({
  width,
  height,
  paint,
});
const strip = (colors: string[]) =>
  pattern(1, colors.length, (_, y) => colors[y]);
const mod = (n: number, m: number) => ((n % m) + m) % m;

export const ROOMS: Record<RoomLook, RoomSurfaces> = {
  // The starting room: the room's own CSS draws it; this is for small pictures.
  plainRoom: {
    wall: {
      tile: pattern(11, 1, (x) => (x === 0 ? "#e9e2d0" : "#f4efdf")),
    },
    floor: { edge: strip(["#dfd1ba"]), tile: strip(["#e9ddc6"]) },
  },
  // Cream wall with faint dots over wood panelling; wooden boards.
  cabinRoom: {
    wall: {
      tile: pattern(8, 16, (x, y) =>
        (y === 3 && x === 0) || (y === 11 && x === 4) ? "#e7dcc3" : "#f4efdf",
      ),
      edge: pattern(13, 11, (x, y) => {
        if (y === 0) return "#ecdcbc";
        if (y === 1 || y === 10 || x === 0)
          return y === 1 ? "#c9a97f" : "#c4a67c";
        return x === 1 ? "#e8d6b5" : "#dcc39d";
      }),
    },
    floor: {
      edge: strip(["#a98660"]),
      tile: pattern(18, 8, (x, y) => {
        const board = Math.floor(y / 4);
        const row = y % 4;
        if (row === 3 || (x + (board ? 9 : 0)) % 18 === 0) return "#c29e72";
        if (row === 1 && (x * 7 + board * 5) % 13 === 0) return "#cba67a";
        return board ? "#dabd94" : "#d3b388";
      }),
    },
  },
  // Blush wall with little four-petal flowers; beige checked tiles.
  floralRoom: {
    wall: {
      tile: pattern(16, 24, (x, y) => {
        const row = Math.floor(y / 12);
        const dx = mod(x - row * 8, 16) - 8;
        const dy = y - (row * 12 + 6);
        if (dx === 0 && dy === 0) return "#f3d68e";
        if (Math.abs(dx) + Math.abs(dy) === 1) return "#f0c9cd";
        if (dx === 2 && dy === 2) return "#cddcbd";
        return "#f8efe9";
      }),
      edge: strip(["#ead8cf", "#d9bfb6"]),
    },
    floor: {
      edge: strip(["#cdb79a"]),
      tile: pattern(12, 12, (x, y) =>
        (Math.floor(x / 6) + Math.floor(y / 6)) % 2 ? "#f1e7d6" : "#e7d8c0",
      ),
    },
  },
  // Two-tone cream stripes over a skirting board; herringbone boards.
  stripeRoom: {
    wall: {
      tile: pattern(12, 1, (x) =>
        x === 0 ? "#e2d3b3" : Math.floor(x / 6) ? "#f0e5ca" : "#f6efdc",
      ),
      edge: strip(["#f2e8d2", "#cdb38d", "#b89a72"]),
    },
    floor: {
      edge: strip(["#a07c55"]),
      tile: pattern(8, 8, (x, y) => {
        const d = Math.floor(x / 4) % 2 ? (x + y) % 8 : mod(x - y, 8);
        if (d === 0) return "#b8956a";
        return d < 4 ? "#d1ae82" : "#c8a477";
      }),
    },
  },
};

/** A pattern drawn once, as a CSS image for repeating backgrounds. */
export function patternUrl({ width, height, paint }: Pattern) {
  return artUrl(paintArt(width, height, paint));
}

/** A drawing as a CSS image. */
export function artUrl(art: PixelArt) {
  const paths = art.paths
    .map(([color, d]) => `<path fill="${color}" d="${d}"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.width} ${art.height}" shape-rendering="crispEdges">${paths}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** A corner of the room where the wall meets the floor, for small pictures. */
export function roomPicture(look: RoomLook, size = 16): PixelArt {
  const { wall, floor } = ROOMS[look];
  const floorTop = Math.round(size * 0.62);
  const tiled = ({ width, height, paint }: Pattern, x: number, y: number) =>
    paint(x % width, y % height);
  return paintArt(size, size, (x, y) => {
    if (y < floorTop) {
      const up = floorTop - 1 - y; // rows above the floor line
      if (wall.edge && up < wall.edge.height)
        return tiled(wall.edge, x, wall.edge.height - 1 - up);
      return tiled(wall.tile, x, y);
    }
    const down = y - floorTop;
    if (floor.edge && down < floor.edge.height)
      return tiled(floor.edge, x, down);
    return tiled(floor.tile, x, down);
  });
}

// --- Rugs -------------------------------------------------------------------------
type RugLook = Extract<
  LookId,
  "plainRug" | "braidRug" | "pinkRug" | "fringeRug"
>;
/** Rug sizes in cells: on the floor, and as a small picture. */
const RUG_SIZE = { room: [45, 12], small: [23, 7] } as const;

/** An oval: `paint` gets the distance from the middle (1 at the edge). */
const oval =
  (
    width: number,
    height: number,
    paint: (r: number, angle: number, x: number, y: number) => string | null,
  ): Paint =>
  (x, y) => {
    const dx = (x + 0.5 - width / 2) / (width / 2);
    const dy = (y + 0.5 - height / 2) / (height / 2);
    return paint(Math.hypot(dx, dy), Math.atan2(dy, dx), x, y);
  };

const RUGS: Record<RugLook, (width: number, height: number) => Paint> = {
  // The starting rug: the room's own CSS draws it; this is for small pictures.
  plainRug: (w, h) =>
    oval(w, h, (r) => {
      if (r > 1) return null;
      if (r > 0.86) return "#d5b496";
      return r > 0.7 ? "#e0c3a8" : "#d5b496";
    }),
  // Braided rings: brick, cream, sage.
  braidRug: (w, h) =>
    oval(w, h, (r, _, x, y) => {
      if (r > 1) return null;
      const twist = (x + y) % 2 === 1;
      if (r > 0.86) return twist ? "#a8584a" : "#8f4a3e";
      if (r > 0.72) return "#ead5ab";
      if (r > 0.58) return twist ? "#8fa37a" : "#7d9168";
      if (r > 0.44) return "#ead5ab";
      return r > 0.3 ? "#c98a6a" : "#ead5ab";
    }),
  // Pink with a wavy edge and little dots.
  pinkRug: (w, h) =>
    oval(w, h, (r, angle, x, y) => {
      const edge = 0.93 + 0.06 * Math.cos(angle * 16);
      if (r > edge) return null;
      if (r > edge - 0.12) return "#dc909a";
      if (r > edge - 0.2) return "#f6d3d3";
      if (r < 0.7 && (x + y * 3) % 7 === 0) return "#e8a2ab";
      return "#f2c2c4";
    }),
  // Blue and square, with a diamond in the middle and tassels at both ends.
  fringeRug: (w, h) => {
    const fringe = w > 30 ? 2 : 1;
    const inner = w - fringe * 2;
    return (x, y) => {
      if (x < fringe || x >= w - fringe)
        return y % 2 === 0 && y > 0 && y < h - 1 ? "#efe3c8" : null;
      const ix = x - fringe;
      const ring = Math.min(ix, inner - 1 - ix, y, h - 1 - y);
      if (ring === 0) return "#efe3c8";
      if (ring === 1) return "#c9785f";
      const diamond =
        Math.abs(ix + 0.5 - inner / 2) / 2 + Math.abs(y + 0.5 - h / 2);
      if (diamond < 1) return "#efe3c8";
      if (diamond < 2) return "#c9785f";
      if (diamond < 3 && h > 8) return "#efe3c8";
      return "#7d94b2";
    };
  },
};

export function rugArt(look: RugLook, size: keyof typeof RUG_SIZE = "room") {
  const [width, height] = RUG_SIZE[size];
  return paintArt(width, height, RUGS[look](width, height));
}

const isWindowLook = (look: LookId): look is WindowLook =>
  look.endsWith("Window");
export const isRoomLook = (look: LookId): look is RoomLook =>
  look.endsWith("Room");
export const isRugLook = (look: LookId): look is RugLook =>
  look.endsWith("Rug");

const drawn = new Map<string, PixelArt>();
/** Draw once, then reuse: looks are fixed drawings. */
function cached(key: string, draw: () => PixelArt) {
  let art = drawn.get(key);
  if (!art) drawn.set(key, (art = draw()));
  return art;
}

/** The drawing for any look, in any slot: walls and rugs as small pictures. */
export function lookArt(look: LookId, time: TimeOfDay): PixelArt {
  if (isWindowLook(look))
    return cached(`${look}:${time}`, () => windowArt(look, time));
  if (isRoomLook(look)) return cached(look, () => roomPicture(look));
  if (isRugLook(look)) return cached(look, () => rugArt(look, "small"));
  return cached(look, () => potArt(look as PotLook));
}

/** A rug as it lies on the floor. */
export const floorRugArt = (look: RugLook) =>
  cached(`${look}:floor`, () => rugArt(look));
