import type { ItemId } from "../items";

// 돌봄 기계의 도트 아이콘. 한 글자가 한 칸이고 '.'은 비워 둡니다.
// 색은 방 그림과 같은 고정 팔레트라 라이트/다크 모드에서 바뀌지 않습니다.

type Pixels = { rows: string[]; colors: Record<string, string> };

function pixelPaths({ rows, colors }: Pixels) {
  return Object.entries(colors).map(([key, color]) => {
    let d = "";
    rows.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === key) d += `M${x} ${y}h1v1h-1z`;
      }),
    );
    return <path key={key} d={d} fill={color} />;
  });
}

function PixelIcon({ art, size = 14 }: { art: Pixels; size?: number }) {
  const width = art.rows[0].length;
  const height = art.rows.length;
  return (
    <svg
      width={(size * width) / height}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {pixelPaths(art)}
    </svg>
  );
}

const HEART_ROWS = [
  ".##.##.",
  "#o#####",
  "#######",
  ".#####.",
  "..###..",
  "...#...",
];
const HEART = { rows: HEART_ROWS, colors: { "#": "#d9707c", o: "#ffd1d6" } };
const BONE = {
  rows: [".##...##.", "#oo###oo#", ".#ooooo#.", "#oo###oo#", ".##...##."],
  colors: { "#": "#b07a3c", o: "#e6b766" },
};
const PAW = {
  rows: [
    ".#.#.#.",
    ".#.#.#.",
    "#.....#",
    "#.###.#",
    "..###..",
    ".#####.",
    ".##.##.",
  ],
  colors: { "#": "#4f7a55" },
};

const STATUS = {
  idle: {
    rows: [
      "..####..",
      ".######.",
      "##o##o##",
      "########",
      "#o####o#",
      "##oooo##",
      ".######.",
      "..####..",
    ],
    colors: { "#": "#e3a842", o: "#7a4e14" },
  },
  happy: HEART,
  sleeping: {
    rows: [
      ".....###",
      "......#.",
      ".....###",
      "#####...",
      "...#....",
      "..#.....",
      ".#......",
      "#####...",
    ],
    colors: { "#": "#7486ad" },
  },
  startled: {
    rows: ["##", "##", "##", "##", "##", "..", "##", "##"],
    colors: { "#": "#d08a2b" },
  },
  snacking: BONE,
  walk: PAW,
  decorate: {
    rows: [
      "......##",
      ".....###",
      "....###.",
      "...###..",
      "..oo#...",
      ".oooo...",
      "oooo....",
      "oo......",
    ],
    colors: { "#": "#a6735a", o: "#d0703f" },
  },
  levelUp: {
    rows: [
      "...##...",
      "...##...",
      "..####..",
      "########",
      "########",
      "..####..",
      "...##...",
      "...##...",
    ],
    colors: { "#": "#d79a2b" },
  },
} satisfies Record<string, Pixels>;

export type PetStatusIcon = keyof typeof STATUS;

const BOX = {
  rows: [
    ".######.",
    "#oooooo#",
    "#oooooo#",
    "########",
    "#ooyyoo#",
    "#ooyyoo#",
    "#oooooo#",
    "########",
  ],
  colors: { "#": "#6a4a2c", o: "#c48a4f", y: "#f2c94c" },
};

const ITEM_ART = {
  leaf: {
    rows: [
      "......##",
      "....####",
      "..####o#",
      ".###o###",
      ".##o####",
      "##o####.",
      "#o###...",
      "o.......",
    ],
    colors: { "#": "#79a85f", o: "#4f7a3f" },
  },
  twig: {
    rows: [
      "......##",
      ".....#..",
      "..#.##..",
      "...##...",
      "...#....",
      "..#.....",
      ".#......",
      "#.......",
    ],
    colors: { "#": "#8a6239" },
  },
  stone: {
    rows: [
      "........",
      "..####..",
      ".#oo###.",
      "#o######",
      "########",
      "########",
      ".######.",
      "........",
    ],
    colors: { "#": "#8f8c86", o: "#c4c0b8" },
  },
  pinecone: {
    rows: [
      "...##...",
      "..#oo#..",
      ".#o##o#.",
      ".##oo##.",
      "#o#oo#o#",
      ".#o##o#.",
      "..#oo#..",
      "...##...",
    ],
    colors: { "#": "#6e4a2a", o: "#b07a45" },
  },
  flower: {
    rows: [
      "..#.#..",
      ".#####.",
      "##yyy##",
      ".#yyy#.",
      "##yyy##",
      ".#####.",
      "...g...",
      "..gg...",
    ],
    colors: { "#": "#e48aa0", y: "#f2c94c", g: "#6f9c5a" },
  },
  ball: {
    rows: [
      "..####..",
      ".#o####.",
      "########",
      "wwwwwwww",
      "########",
      "########",
      ".######.",
      "..####..",
    ],
    colors: { "#": "#d9534f", o: "#f3a6a3", w: "#f7f1e3" },
  },
} satisfies Record<ItemId, Pixels>;

/** A found item, or its silhouette while it has not been found yet. */
export function ItemIcon({
  item,
  size = 14,
  unknown = false,
}: {
  item: ItemId;
  size?: number;
  unknown?: boolean;
}) {
  const art = ITEM_ART[item];
  return (
    <PixelIcon
      art={
        unknown
          ? {
              rows: art.rows,
              colors: Object.fromEntries(
                Object.keys(art.colors).map((key) => [key, "#6b5f55"]),
              ),
            }
          : art
      }
      size={size}
    />
  );
}

const MAP = {
  home: {
    rows: ["...#...", "..###..", ".#####.", "#######", ".##o##.", ".##o##."],
    colors: { "#": "#a6735a", o: "#5e5246" },
  },
  find: {
    rows: ["..#..", "..#..", "#####", "..#..", "..#.."],
    colors: { "#": "#e0a92b" },
  },
} satisfies Record<string, Pixels>;

/** Stops on the walk map: home (A, C) and the find (B). */
export function MapIcon({ stop }: { stop: keyof typeof MAP }) {
  return <PixelIcon art={MAP[stop]} size={stop === "home" ? 11 : 9} />;
}

export function WalkerIcon() {
  return <PixelIcon art={PAW} size={11} />;
}

export function StatusIcon({ status }: { status: PetStatusIcon }) {
  return <PixelIcon art={STATUS[status]} />;
}

// 꾸미기 모드 버튼: 이전·다음·고르기·취소
const KEY_INK = { "#": "#5e5246" };
const PREV = {
  rows: ["...#", "..##", ".###", "####", ".###", "..##", "...#"],
  colors: KEY_INK,
};
const NEXT = {
  rows: ["#...", "##..", "###.", "####", "###.", "##..", "#..."],
  colors: KEY_INK,
};
const OK = {
  rows: [
    "......##",
    ".....##.",
    "#...##..",
    "##.##...",
    ".###....",
    "..#.....",
  ],
  colors: { "#": "#3f6b45" },
};
const CANCEL = {
  rows: ["##...##", ".##.##.", "..###..", ".##.##.", "##...##"],
  colors: { "#": "#a24f5c" },
};

const SKIP = {
  rows: [
    "#...#...",
    "##..##..",
    "###.###.",
    "########",
    "###.###.",
    "##..##..",
    "#...#...",
  ],
  colors: { "#": "#3f6b45" },
};

export type PadKind =
  "pet" | "feed" | "walk" | "skip" | "box" | "prev" | "next" | "ok" | "cancel";

/** 버튼 위 큰 아이콘 */
export function PadIcon({ kind }: { kind: PadKind }) {
  const art = {
    pet: HEART,
    feed: BONE,
    walk: PAW,
    box: BOX,
    skip: SKIP,
    prev: PREV,
    next: NEXT,
    ok: OK,
    cancel: CANCEL,
  }[kind];
  return (
    <PixelIcon art={art} size={kind === "ok" || kind === "cancel" ? 16 : 20} />
  );
}

// 친밀도 하트: 빈 칸, 왼쪽 절반, 가득. 칠하지 않은 칸은 흐린 색으로 남깁니다.
const HALF = Math.ceil(HEART_ROWS[0].length / 2);
const meterHeart = (filled: (x: number) => boolean): Pixels => ({
  rows: HEART_ROWS.map((row) =>
    [...row]
      .map((cell, x) => (cell === "." || filled(x) ? cell : "e"))
      .join(""),
  ),
  colors: { ...HEART.colors, e: "#cdbea4" },
});
const METER = {
  0: meterHeart(() => false),
  0.5: meterHeart((x) => x < HALF),
  1: meterHeart(() => true),
};

const LOCK = {
  rows: [".####.", "##..##", "#....#", "######", "##oo##", "##oo##", "######"],
  colors: { "#": "#8a7c6c", o: "#5e5246" },
};

/** 친밀도 설명 줄 앞의 작은 아이콘 */
export function RuleIcon({ kind }: { kind: "snack" | "lock" }) {
  return kind === "snack" ? (
    <PixelIcon art={BONE} size={9} />
  ) : (
    <PixelIcon art={LOCK} size={11} />
  );
}

/** 친밀도 하트 한 칸. fill은 0(빈 칸), 0.5(왼쪽 절반), 1(가득) */
export function MeterHeart({ fill }: { fill: keyof typeof METER }) {
  return <PixelIcon art={METER[fill]} size={11} />;
}
