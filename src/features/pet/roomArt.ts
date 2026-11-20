import type { LookId, SlotLook } from "./furniture";
import { OUTFIT_UPRIGHT } from "./sprites/homeScene";
import { picture, WORN_LOOKS, type WornLook } from "./sprites/outfitCells";

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
  /**
   * In the room, how far the drawing hangs over the left and top of its
   * place, in cells: the palace window's curtains.
   */
  overhang?: { x: number; y: number };
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
/** See-through, so the gold window sits on dark walls as well as light ones. */
const SHEER_SHADOW = "rgba(58, 20, 12, 0.28)";
const CREAM = "#fdf9ed";
const GOLD = "#e2b54c";
const GOLD_LIGHT = "#f3d27a";
const GOLD_SHADE = "#a8792a";
const WINE = "#8e1a2d";
const NAVY = "#23325e";
const TASSEL = "#efe3c8";
const TWIG = "#8a6239";

type WindowLook = SlotLook<"window">;
/** Windows whose glass has a round top. */
const ARCHED = new Set<WindowLook>(["stoneWindow", "palaceWindow"]);

function inPane(look: WindowLook, x: number, y: number) {
  if (x < PANE.x0 || x > PANE.x1 || y < PANE.y0 || y > PANE.y1) return false;
  if (!ARCHED.has(look)) return true;
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
  // Gold, lit from the top left.
  palaceWindow: (x, y) =>
    x + y < 10 ? GOLD_LIGHT : x + y > 22 ? GOLD_SHADE : GOLD,
};
const barColor: Record<WindowLook, string> = {
  plainWindow: CREAM,
  flowerWindow: CREAM,
  twigWindow: TWIG,
  stoneWindow: TWIG,
  palaceWindow: GOLD,
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
  palaceWindow: [],
};

export function windowArt(look: WindowLook, time: TimeOfDay): PixelArt {
  const cells = windowCells(look, time);
  if (look === "palaceWindow") return drapeCurtains(cells);
  return toArt(cells, WINDOW_WIDTH, WINDOW_HEIGHT);
}

function windowCells(look: WindowLook, time: TimeOfDay): Cells {
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
      if (solid(x - 1, y - 1) && !solid(x, y))
        set(x, y, look === "palaceWindow" ? SHEER_SHADOW : SHADOW);

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
  return cells;
}

// 궁전 창은 커튼이 창 양옆으로 늘어져 그림이 더 큽니다. 유리는 다른 창과 같은 자리에
// 오도록 방에서 커튼만큼(overhang) 왼쪽·위로 당겨 둡니다(PetRoomArt).
const CURTAIN_SPACE = { x: 3, y: 1 };
const VELVET = ["#b3243a", WINE];
/** How wide each curtain hangs on a row: full, gathered at the tie, then flaring. */
const CURTAIN_WIDTH = [
  0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 2, 2, 3, 3, 4, 4, 4, 4,
];
const TIE_ROW = 12;

/** The window moved into a bigger picture, under a gold rod and red curtains. */
function drapeCurtains(window: Cells): PixelArt {
  const width = WINDOW_WIDTH + CURTAIN_SPACE.x * 2;
  const height = CURTAIN_WIDTH.length;
  const cells: Cells = new Map();
  for (const [key, color] of window) {
    const [x, y] = key.split(",").map(Number);
    cells.set(`${x + CURTAIN_SPACE.x},${y + CURTAIN_SPACE.y}`, color);
  }
  const set = (x: number, y: number, color: string) =>
    cells.set(`${x},${y}`, color);
  for (let x = 1; x < width - 1; x++) set(x, 0, GOLD);
  set(0, 0, GOLD_SHADE);
  set(width - 1, 0, GOLD_SHADE);
  CURTAIN_WIDTH.forEach((hang, y) => {
    for (let i = 0; i < hang; i++) {
      const color = y === TIE_ROW ? GOLD : VELVET[i % 2];
      set(1 + i, y, color);
      set(width - 2 - i, y, color);
    }
  });
  return { ...toArt(cells, width, height), overhang: CURTAIN_SPACE };
}

// --- Pot ----------------------------------------------------------------------
type PotLook = SlotLook<"pot">;
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
  palacePot: {
    rows: [
      "..rpr.......",
      "..pcr..rpr..",
      "..rrpl.pcr..",
      "....lL.rrp..",
      "lrpr.rpr.lL.",
      ".pcr.pcr.rpr",
      ".rrp.rrp.pcr",
      "..L.l.l.lrrp",
      "...l.l.L....",
      ".GGGGGGGGGG.",
      "..ssssssss..",
      "..hhhggggs..",
      "..GbGbGbGb..",
      "...hgggss...",
      "....ssss....",
      "...GGGGGG...",
    ],
    colors: {
      r: "#c8283f",
      p: "#ef6b7d",
      c: "#7a1528",
      l: "#4f8a4a",
      L: "#3b6d38",
      G: GOLD,
      s: GOLD_SHADE,
      h: "#f6dc8a",
      g: "#d9a940",
      b: WINE,
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
type RoomLook = SlotLook<"room">;
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

/** One damask flower, 9 x 9 in a 14 x 12 cell: gold (g) and dark (d) lines. */
const DAMASK = [
  "....g....",
  "...ddd...",
  "..dd.dd..",
  ".dd.g.dd.",
  "dd.ggg.dd",
  ".dd.g.dd.",
  "..dd.dd..",
  "...ddd...",
  "....d....",
];

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
  // Burgundy damask over a dark panelled wainscot; marble checks.
  palaceRoom: {
    wall: {
      tile: pattern(14, 24, (x, y) => {
        const row = Math.floor(y / 12);
        const cell = DAMASK[y % 12]?.[mod(x - row * 7, 14)];
        if (cell === "g") return GOLD;
        return cell === "d" ? "#5e1828" : "#7d2436";
      }),
      edge: pattern(14, 11, (x, y) => {
        if (y === 0) return GOLD;
        if (y === 1 || y === 10) return GOLD_SHADE;
        if (x === 0 || x === 13) return "#4a1220";
        const panel = x >= 2 && x <= 11 && y >= 3 && y <= 8;
        const rim = x === 2 || x === 11 || y === 3 || y === 8;
        return panel && rim ? GOLD_SHADE : "#5c1828";
      }),
    },
    floor: {
      edge: strip([GOLD, GOLD_SHADE]),
      tile: pattern(14, 10, (x, y) => {
        const light = (Math.floor(x / 7) + Math.floor(y / 5)) % 2 === 0;
        const [i, j] = [x % 7, y % 5];
        if (light) return (i + j * 2) % 9 === 0 ? "#d9d2c8" : "#f1ece4";
        return (i * 2 + j) % 8 === 0 ? "#9a948c" : "#b8b2aa";
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
type RugLook = SlotLook<"rug">;
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

/**
 * A square rug with cream tassels at both ends. `paint` gets each cell inside
 * the tassels, its ring counted from the edge, and the width inside.
 */
function tasselRug(
  width: number,
  height: number,
  paint: (x: number, y: number, ring: number, inner: number) => string,
): Paint {
  const fringe = width > 30 ? 2 : 1;
  const inner = width - fringe * 2;
  return (x, y) => {
    if (x < fringe || x >= width - fringe)
      return y % 2 === 0 && y > 0 && y < height - 1 ? TASSEL : null;
    const ix = x - fringe;
    return paint(ix, y, Math.min(ix, inner - 1 - ix, y, height - 1 - y), inner);
  };
}

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
  fringeRug: (w, h) =>
    tasselRug(w, h, (x, y, ring, inner) => {
      if (ring === 0) return TASSEL;
      if (ring === 1) return "#c9785f";
      const diamond =
        Math.abs(x + 0.5 - inner / 2) / 2 + Math.abs(y + 0.5 - h / 2);
      if (diamond < 1) return TASSEL;
      if (diamond < 2) return "#c9785f";
      if (diamond < 3 && h > 8) return TASSEL;
      return "#7d94b2";
    }),
  // Persian: navy and gold borders, a red field, a gold medallion, tassels.
  palaceRug: (w, h) => {
    const big = h > 8;
    const middle = (h - 1) / 2;
    return tasselRug(w, h, (x, y, ring, inner) => {
      if (ring === 0) return NAVY;
      if (ring === 1) return GOLD;
      if (ring === 2 && big) return (x + y) % 2 ? "#3a4c86" : NAVY;
      const m = Math.abs(x - (inner - 1) / 2) / 2.2 + Math.abs(y - middle);
      if (m < 1) return GOLD;
      if (m < 2) return NAVY;
      if (big && m < 3) return GOLD;
      if (big && m < 3.6) return TASSEL;
      const side = (at: number) =>
        Math.abs(x - at) + Math.abs(y - middle) * 1.5 < (big ? 2.2 : 1.2);
      if (side(inner * 0.16) || side(inner * 0.84 - 1)) return GOLD;
      if (big && (x + y) % 6 === 0) return WINE;
      return "#a3263a";
    });
  },
};

export function rugArt(look: RugLook, size: keyof typeof RUG_SIZE = "room") {
  const [width, height] = RUG_SIZE[size];
  return paintArt(width, height, RUGS[look](width, height));
}

// --- Outfits --------------------------------------------------------------------
// 까미 옷은 집 까미 장면에 그려지고(sprites/homeScene.ts), 상자·기록창에는
// 서 있는 옷만 떼어 낸 작은 그림을 씁니다.
type OutfitLook = WornLook;
/** The starting collar and tag, as worn today. */
const PLAIN_OUTFIT = paintArt(14, 4, (x, y) => {
  if (y < 2) return "#d98770";
  return x >= 6 && x <= 7 ? "#e5b95b" : null;
});
export const isOutfitLook = (
  look: LookId,
): look is OutfitLook | "plainOutfit" =>
  look === "plainOutfit" || (WORN_LOOKS as readonly LookId[]).includes(look);
function outfitArt(look: OutfitLook | "plainOutfit") {
  if (look === "plainOutfit") return PLAIN_OUTFIT;
  const { width, height, cells } = picture(OUTFIT_UPRIGHT[look]);
  const colors = new Map(cells.map(([x, y, c]) => [`${x},${y}`, c]));
  return paintArt(width, height, (x, y) => colors.get(`${x},${y}`) ?? null);
}

// --- Speech bubbles -----------------------------------------------------------
// 만들기·꾸미기 목록에 보이는 작은 말풍선 그림. 방의 말풍선은 CSS로 그립니다(PetSpeechBubble).
type BubbleLook = SlotLook<"bubble">;
const isBubbleLook = (look: LookId): look is BubbleLook =>
  look.endsWith("Bubble");
type BubbleInk = { line: string; paper: string; text: string };
const BUBBLE_INK: Record<BubbleLook, BubbleInk> = {
  plainBubble: { line: "#c9b99a", paper: "#fffcf5", text: "#b6a68a" },
  gameBubble: { line: "#22305a", paper: "#22305a", text: "#f7f3e6" },
  cloudBubble: { line: "#b9c7d8", paper: "#ffffff", text: "#8a97ab" },
  heartBubble: { line: "#e58a9d", paper: "#ffe4ea", text: "#c56f83" },
  stampBubble: { line: "#c8664a", paper: "#fff6e2", text: "#9c6a4a" },
};
const HEART_MARK = ["#.#", "###", ".#."];
/** 16 x 12: the box (rows 0–8) and its tail below. */
function bubbleArt(look: BubbleLook): PixelArt {
  const { line, paper, text } = BUBBLE_INK[look];
  return paintArt(16, 12, (x, y) => {
    const edge = x === 0 || x === 15 || y === 0 || y === 8;
    const words =
      (y === 3 && x >= 3 && x <= 12) || (y === 5 && x >= 3 && x <= 9);
    if (y > 8) {
      // Tail: thought dots for the cloud, none for the game box.
      if (look === "gameBubble") return null;
      if (look === "cloudBubble")
        return (y === 10 && (x === 5 || x === 6)) || (y === 11 && x === 3)
          ? line
          : null;
      if (y === 9) return x === 6 || x === 8 ? line : x === 7 ? paper : null;
      return y === 10 && (x === 7 || x === 8) ? line : null;
    }
    if (look === "heartBubble") {
      const mark = (ox: number, oy: number) =>
        HEART_MARK[y - oy]?.[x - ox] === "#";
      if (mark(0, 0) || mark(13, 6)) return "#e0607a";
    }
    if (look === "cloudBubble") {
      const corner = (x < 2 || x > 13) && (y < 2 || y > 6);
      if (corner)
        return (x === 1 || x === 14) && (y === 1 || y === 7) ? line : null;
    }
    if (look === "stampBubble") {
      if (edge) return (x + y) % 2 === 0 ? paper : null;
      const frame =
        ((x === 2 || x === 13) && y >= 2 && y <= 6) ||
        ((y === 2 || y === 6) && x >= 2 && x <= 13);
      if (frame) return line;
    }
    if (look === "gameBubble") {
      const ring = (x === 1 || x === 14 || y === 1 || y === 7) && !edge;
      if (ring) return "#f7f3e6";
      if ((y === 5 && x >= 11 && x <= 13) || (y === 6 && x === 12))
        return "#f2c45a";
    }
    if (edge) return line;
    return words ? text : paper;
  });
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
  if (isOutfitLook(look)) return cached(look, () => outfitArt(look));
  if (isBubbleLook(look)) return cached(look, () => bubbleArt(look));
  return cached(look, () => potArt(look as PotLook));
}

/** A rug as it lies on the floor. */
export const floorRugArt = (look: RugLook) =>
  cached(`${look}:floor`, () => rugArt(look));
