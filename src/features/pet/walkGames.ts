// 산책 놀이 (I-076): 산책하기를 누르면 게임기 화면 안에서 놀이를 고름.
// 친밀도 레벨 n이 되면 n번째 놀이가 열림(1~5). 아직 만드는 중인 놀이는 보이기만 함

export const WALK_GAMES = [
  // 지금의 재료 모으기 산책
  { id: "walk", level: 1, ready: true },
  // 장애물 달리기 (I-077): 열려도 아직 시작할 수 없음
  { id: "run", level: 2, ready: false },
] as const satisfies readonly { id: string; level: number; ready: boolean }[];

export type WalkGame = (typeof WALK_GAMES)[number];
export type WalkGameId = WalkGame["id"];

/** The game is open at this affinity level. */
export const isGameOpen = (game: WalkGame, level: number) =>
  level >= game.level;

/** What a game's card says it is: locked, open but not made yet, or ready. */
export function gameState(game: WalkGame, level: number) {
  if (!isGameOpen(game, level)) return "locked";
  return game.ready ? "ready" : "soon";
}

// 카드 그림: 42×26칸의 공원 산책길에 까미
const W = 42;
const H = 26;
type Grid = string[][];
const stamp = (grid: Grid, rows: readonly string[], x0: number, y0: number) =>
  rows.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (cell !== "." && grid[y0 + y]?.[x0 + x] !== undefined)
        grid[y0 + y][x0 + x] = cell;
    }),
  );

// 옆에서 본 까미(오른쪽을 봄): 걷기와 점프
const KKAMI = [
  "..........k...",
  ".........kkk..",
  "k........kkkkn",
  ".k.......kwkkk",
  "..kkkkkkkkkkk.",
  "..kkkkkkkkkr..",
  "..kkkkkkkkk...",
  "..k.k....k.k..",
  "..k.k....k.k..",
];
const KKAMI_JUMP = [
  "..........k...",
  ".........kkk..",
  "k........kkkkn",
  ".k.......kwkkk",
  "..kkkkkkkkkkk.",
  "..kkkkkkkkkr..",
  ".kkkkkkkkkk...",
  "kk.........kk.",
];
const LEAF = [".L.", "LLL", ".g."];
const FLOWER = [".F.", "FfF", ".F."];
const TREE = [".LLL.", "LLLLL", "LgLLL", ".LLL.", "..t..", "..t.."];
const ROCK = ["..RRR..", ".RRRRR.", "RRRRqRR", "RqRRRRq"];
const PUDDLE = [".BBBBBB.", "BbBBBBbB"];
const CLOUD = ["..cccc..", ".cccccc.", "cccccccc"];
const SMALL_CLOUD = [".ccc.", "ccccc"];
const SPEED = ["c.c", "...", "c.c"];

/** Sky above, a grass strip, the path, grass below; specks on the path. */
function park(): Grid {
  const grid = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (): string =>
      y < 8 ? "S" : y < 16 ? "s" : y < 18 ? "G" : y < 23 ? "p" : "G",
    ),
  );
  for (let x = 1; x < W; x += 5) grid[20 + (x % 3)][x] = "P";
  stamp(grid, CLOUD, 4, 2);
  stamp(grid, SMALL_CLOUD, 28, 4);
  return grid;
}

export const WALK_GAME_COLORS = {
  k: "#2b2320",
  n: "#1a1412",
  w: "#ffffff",
  r: "#d0383a",
  S: "#e8f4f8",
  s: "#cfe8f2",
  c: "#ffffff",
  G: "#7dbf6a",
  g: "#5a9a4c",
  L: "#6fae4a",
  t: "#a8792a",
  p: "#d9c29a",
  P: "#c4a878",
  F: "#f29bb4",
  f: "#f2c94c",
  R: "#9a948a",
  q: "#7d776d",
  B: "#6aa9d8",
  b: "#4f8ac0",
};

/** A game's picture on its card: Kkami out on the park path. */
export function walkGameArt(id: WalkGameId): string[] {
  const grid = park();
  if (id === "walk") {
    stamp(grid, KKAMI, 12, 12);
    stamp(grid, LEAF, 30, 18);
    stamp(grid, FLOWER, 36, 19);
    stamp(grid, LEAF, 4, 19);
    stamp(grid, TREE, 34, 10);
  } else {
    stamp(grid, KKAMI_JUMP, 13, 6);
    stamp(grid, SPEED, 7, 10);
    stamp(grid, ROCK, 17, 16);
    stamp(grid, PUDDLE, 32, 19);
    stamp(grid, LEAF, 3, 18);
  }
  return grid.map((row) => row.join(""));
}
