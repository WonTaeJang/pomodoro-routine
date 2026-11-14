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

export function StatusIcon({ status }: { status: PetStatusIcon }) {
  return <PixelIcon art={STATUS[status]} />;
}

/** 버튼 위 큰 아이콘 */
export function PadIcon({ kind }: { kind: "pet" | "feed" | "walk" }) {
  const art = { pet: HEART, feed: BONE, walk: PAW }[kind];
  return <PixelIcon art={art} size={22} />;
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

/** 친밀도 하트 한 칸. fill은 0(빈 칸), 0.5(왼쪽 절반), 1(가득) */
export function MeterHeart({ fill }: { fill: keyof typeof METER }) {
  return <PixelIcon art={METER[fill]} size={11} />;
}
