import type { Material, Slot } from "../furniture";
import type { ItemId } from "../items";

// 돌봄 기계의 도트 아이콘. 한 글자가 한 칸이고 '.'은 비워 둡니다.
// 색은 방 그림과 같은 고정 팔레트라 라이트/다크 모드에서 바뀌지 않습니다.

type Pixels = { rows: string[]; colors: Record<string, string> };

// 금빛 아이콘(레벨업·궁전)과 궁전 왕관이 함께 쓰는 색
const GOLD = "#d79a2b";
const GOLD_SHADE = "#a8792a";
const RUBY = "#c8283f";

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
  // 궁전 에디션 안내 (I-067)
  palace: {
    rows: [
      "#..##..#",
      "##.##.##",
      "########",
      "##o##o##",
      "########",
      "ssssssss",
    ],
    colors: { "#": GOLD, o: RUBY, s: GOLD_SHADE },
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
    colors: { "#": GOLD },
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
  // 야구공: 다른 아이템보다 한 칸 큰 10×10이라 휜 솔기가 또렷합니다.
  ball: {
    rows: [
      "...####...",
      ".##rwwr##.",
      ".#rwwwwr#.",
      "#wrwwwwrw#",
      "#wwrwwrww#",
      "#wwrwwrww#",
      "#wrwwwwrw#",
      ".#rwwwwr#.",
      ".##rssr##.",
      "...####...",
    ],
    colors: { "#": "#8a7f72", w: "#fbf8f1", r: "#d9534f", s: "#ddd3c2" },
  },
} satisfies Record<ItemId, Pixels>;

const silhouette = ({ rows, colors }: Pixels): Pixels => ({
  rows,
  colors: Object.fromEntries(
    Object.keys(colors).map((key) => [key, "#6b5f55"]),
  ),
});

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
  return <PixelIcon art={unknown ? silhouette(art) : art} size={size} />;
}

/** A heart earned by reaching a level, or its silhouette before the first. */
// 사이클 보상 발바닥 도장: 금색 동전에 찍힌 발바닥 (할 일의 🐾 개수와 헷갈리지 않게 동전 모양)
const PAW_COIN = {
  rows: [
    "....###....",
    "..##ooo##..",
    ".#hxoxoxo#.",
    ".#oxoxoxo#.",
    "#oxoooooxo#",
    "#oxoxxxoxo#",
    "#oooxxxooo#",
    ".#oxxxxxo#.",
    ".#oxxoxxo#.",
    "..##ooo##..",
    "....###....",
  ],
  colors: { "#": "#b8862b", o: "#f2c45a", h: "#fbe3a0", x: "#8a5a2b" },
};

/** The paw stamp from finishing a cycle (I-066). */
export function PawItemIcon({
  size = 14,
  unknown = false,
}: {
  size?: number;
  unknown?: boolean;
}) {
  return (
    <PixelIcon art={unknown ? silhouette(PAW_COIN) : PAW_COIN} size={size} />
  );
}

// 말풍선 장식 (I-066): 뭉게구름, 우표 소인, 게임 대화창의 ▼
const BUBBLE_DECOR = {
  cloud: {
    rows: [
      "....####....",
      "..##oooo#...",
      ".#oooooooo#.",
      "#ooooooooo#.",
      "#oooooooooo#",
      ".##########.",
    ],
    colors: { "#": "#b9c7d8", o: "#ffffff" },
  },
  postmark: {
    rows: [
      "....#####....",
      "..##.....##..",
      ".##.......##.",
      ".#..#.#.#..#.",
      "#...#.#.#...#",
      "#..#.....#..#",
      "#..#.###.#..#",
      "#....###....#",
      "#...#####...#",
      ".#..##.##..#.",
      ".##.......##.",
      "..##.....##..",
      "....#####....",
    ],
    colors: { "#": "#c8664a" },
  },
  more: {
    rows: ["#####", ".###.", "..#.."],
    colors: { "#": "#f2c45a" },
  },
  sparkle: {
    rows: [
      "...#...",
      "...#...",
      "..#o#..",
      "##ooo##",
      "..#o#..",
      "...#...",
      "...#...",
    ],
    colors: { "#": "#ffc94a", o: "#fff6c8" },
  },
} satisfies Record<string, Pixels>;

/** A decoration drawn on a speech bubble. */
export function BubbleDecorIcon({
  decor,
  size,
}: {
  decor: keyof typeof BUBBLE_DECOR;
  size: number;
}) {
  return <PixelIcon art={BUBBLE_DECOR[decor]} size={size} />;
}

export function HeartItemIcon({
  size = 14,
  unknown = false,
}: {
  size?: number;
  unknown?: boolean;
}) {
  return <PixelIcon art={unknown ? silhouette(HEART) : HEART} size={size} />;
}

/** Anything a recipe needs: a walk find, a heart or a paw stamp, about the same size. */
export function MaterialIcon({ material }: { material: Material }) {
  if (material === "heart") return <HeartItemIcon size={10} />;
  if (material === "stamp") return <PawItemIcon size={12} />;
  return <ItemIcon item={material} size={12} />;
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

// 궁전 에디션 본체 윗변에 앉는 왕관: 본체 금테(_device.scss의 $palace-gold)와
// 같은 밝은 금, 더 밝은 금 장식, 루비 두 알
const PALACE_CROWN = {
  rows: [
    "g....g....g",
    "gg..ggg..gg",
    "ggg.glg.ggg",
    "ggggrgrgggg",
    "sssssssssss",
  ],
  colors: { g: "#e2b54c", l: "#f6dc8a", r: RUBY, s: GOLD_SHADE },
};
export function PalaceCrown() {
  return <PixelIcon art={PALACE_CROWN} size={20} />;
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

/** 친밀도 설명의 간식 줄 앞 작은 뼈 */
export function SnackRuleIcon() {
  return <PixelIcon art={BONE} size={9} />;
}

/** 친밀도 하트 한 칸. fill은 0(빈 칸), 0.5(왼쪽 절반), 1(가득) */
export function MeterHeart({ fill }: { fill: keyof typeof METER }) {
  return <PixelIcon art={METER[fill]} size={11} />;
}

// 꾸미기 탭의 자리 아이콘: 벽·바닥, 창문, 화분, 카펫, 옷
const SLOT_ART = {
  room: {
    rows: [
      "wwlwwlwwlw",
      "wwlwwlwwlw",
      "wwlwwlwwlw",
      "wwlwwlwwlw",
      "wwlwwlwwlw",
      "kkkkkkkkkk",
      "ffffbfffff",
      "ffffffffff",
      "fbffffffbf",
      "ffffffffff",
    ],
    colors: {
      w: "#f4efdf",
      l: "#d8cbb0",
      k: "#a98660",
      f: "#d3b388",
      b: "#b8956a",
    },
  },
  window: {
    rows: [
      "#########",
      "#sss#sss#",
      "#sss#sss#",
      "#sss#sss#",
      "#########",
      "#sss#sss#",
      "#ggg#ggg#",
      "#ggg#ggg#",
      "#########",
      "bbbbbbbbb",
    ],
    colors: { "#": "#fdf9ed", s: "#c4dbd7", g: "#a3c1a4", b: "#a6735a" },
  },
  pot: {
    rows: [
      "...g.g...",
      "..ggg.g..",
      ".g.ggg.g.",
      "..g.g.g..",
      "....g....",
      ".PPPPPPP.",
      ".PPPPPPd.",
      "..PPPPd..",
      "..PPPPd..",
      "..PPPPd..",
    ],
    colors: { g: "#8fbf7a", P: "#cd9a80", d: "#ab755f" },
  },
  rug: {
    rows: [
      "...rrrrr...",
      ".rrcccccrr.",
      "rcccrrrcccr",
      "rcccrrrcccr",
      ".rrcccccrr.",
      "...rrrrr...",
    ],
    colors: { r: "#c98a6a", c: "#ead5ab" },
  },
  outfit: {
    rows: [
      "..##..##..",
      ".#cc##cc#.",
      "#cccccccc#",
      "#c#cccc#c#",
      "..#cccc#..",
      "..#cccc#..",
      "..#cccc#..",
      "..######..",
    ],
    colors: { "#": "#3f4f75", c: "#c9d8ee" },
  },
  bubble: {
    rows: [
      ".########.",
      "#pppppppp#",
      "#pkkkkkkp#",
      "#pppppppp#",
      "#pkkkkppp#",
      "#pppppppp#",
      ".###.####.",
      "...#.#....",
      "....##....",
    ],
    colors: { "#": "#8a7a62", p: "#fffcf5", k: "#c9b99a" },
  },
} satisfies Record<Slot, Pixels>;

export function SlotIcon({ slot }: { slot: Slot }) {
  const art = SLOT_ART[slot];
  // The same 2px cell for all, so the rug stays low and flat.
  return <PixelIcon art={art} size={art.rows.length * 2} />;
}
