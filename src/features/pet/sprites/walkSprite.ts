// 산책 까미 도트. 집 장면과 같은 4단위 격자에 집 팔레트만 써서 같은 그림으로 보입니다.
// One cell is CELL scene units; positions here are in cells.
import { CELL } from "../pixel/scene";

export { CELL };
export const FPS = 12;
/** One stride per second: a relaxed walk. */
export const FRAMES = 12;
/** Planted paws move one cell per frame, so the path scrolls at the same speed. */
export const PATH_SPEED = CELL * FPS;
/** Front pose, then turning frames, before the first step. */
export const FRONT_FRAMES = 6;
export const TURN_FRAMES = 2;

export const PALETTE: Record<string, string> = {
  K: "292A30", // ink
  F: "414249", // fur
  L: "575962", // light fur
  C: "FFF6DD", // eye highlight
  g: "AAA5A1", // eye glint
  n: "797B83", // nose shine
  R: "D98770", // collar
  Y: "E5B95B", // tag
};

// The home idle pose, cell for cell (the home Kkami node at rest).
// Origin is the top-left cell at (-15, -19) in home Kkami node cells.
const FRONT_ORIGIN = [-15, -19];
const FRONT = [
  "....KKKKKKKKKKKKKKKKKKKKKK.......",
  "....KKFFFFFFFFFFFFFFFFFFKK.......",
  "..KKKKFLLFFFFFFFFFLLLFFFKKKK.....",
  "..KKFLLLLLLFFFFFFFLLLFFFFFKK.....",
  "..KKFLLLLLLFFFFFFFFFFFFFFFKK.....",
  "KKKKFFFFFFFFFFFFFFFFFFFFFFKKKK...",
  "KKKLLFFFFFFFFFFFFFFFFFFFFFKKKK...",
  "KKKLLFFFFFFFFFFFFFFFFFFFFFKKKK...",
  "KKKLLFFFFFFFFFFFFFFFFFFFFFFFKK...",
  "KKKLLFFKCCKFFFFFFFFKCCKFFFFFKK...",
  "KKKLLFFKCCKFFFFFFFFKCCKFFFFFKK...",
  "KKKLLFFKKKKFFFFFFFFKKKKFFFFFKK...",
  "KKKLLFFKKgKFFFFFFFFKKgKFFFFFKK...",
  "KKKKFFFKKKKFFFFFFFFKKKKFFFFFKK...",
  "KKKKFFFFFLLLKnnKKKLLLFFFFFFFKK...",
  "KKKKFFFFFLLLKKKKKKLLLFFFFFFFKK...",
  "KKKKFFFFFLLLLKKKKLLLLFFFFFFFKK...",
  "KKFFFFFFFLLLLLKKLLLLLFFFFFKKKK...",
  "KKFFFFFFFLLLLLKKLLLLLFFFFFKKKK...",
  "KKFFKKFFFFFLLLLLLLLFFFFFKKKKKK...",
  "KKFFKKFFFFFLLLLLLLLFFFFFKKKKKK...",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKFFF",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKFFF",
  ".KKK..KKRRRRRRRRRRRRRRKK..KKKKFFF",
  ".KKK..KKFFFLLLYYLLLFFFKK..KKKKKK.",
  "......KKFFFLLLYYLLLFFFKK.....KKK.",
  "......KKFFFLLLLLLLLFFFKKKKKKKKKK.",
  "......KKFFFLLLLLLLLFFFKKKKKKKKKK.",
  "....KKKKFFFLLLLLLLLFFFKKKKKKKKK..",
  "....KKKKFFFLLLLLLLLFFFKKKK.......",
  "....KKKKFFFLLLLLLLLFFFKKKK.......",
  "....KKKKFFFLLLLLLLLFFFKKKK.......",
  "....KKKKFFFFFFFFFFFFFFKKKK.......",
  "....KKKKFFFFFFFFFFFFFFKKKK.......",
  ".....KFFFFFKKKKKKKKFFFFFK........",
  ".....KFFFFFKKKKKKKKFFFFFK........",
  ".....KKKKKKK......KKKKKKK........",
  ".....KKKKKKK......KKKKKKK........",
];

// The idle head turned a quarter toward the path: eyes and muzzle move two
// cells forward and the far ear tucks behind the head.
const HEAD = [
  "....KKKKKKKKKKKKKKKKKKKKKK..",
  "....KKFFFFFFFFFFFFFFFFFFKK..",
  "..KKKKFLLFFFFFFFFFLLLFFFKKKK",
  "..KKFLLLLLLFFFFFFFLLLFFFFFKK",
  "..KKFLLLLLLFFFFFFFFFFFFFFFKK",
  "KKKKFFFFFFFFFFFFFFFFFFFFFFKK",
  "KKKLLFFFFFFFFFFFFFFFFFFFFFKK",
  "KKKLLFFFFFFFFFFFFFFFFFFFFFKK",
  "KKKLLFFFFFFFFFFFFFFFFFFFFFKK",
  "KKKLLFFFFKCCKFFFFFFFFKCCKFKK",
  "KKKLLFFFFKCCKFFFFFFFFKCCKFKK",
  "KKKLLFFFFKKKKFFFFFFFFKKKKFKK",
  "KKKLLFFFFKKgKFFFFFFFFKKgKFKK",
  "KKKKFFFFFKKKKFFFFFFFFKKKKFKK",
  "KKKKFFFFFFFLLLKnnKKKLLLFFFKK",
  "KKKKFFFFFFFLLLKKKKKKLLLFFFKK",
  "KKKKFFFFFFFLLLLKKKKLLLLFFFKK",
  "KKFFFFFFFFFLLLLLKKLLLLLFFFKK",
  "KKFFFFFFFFFLLLLLKKLLLLLFFFKK",
  "KKFFKKFFFFFFFLLLLLLLLFFFFFKK",
  "KKFFKKFFFFFFFLLLLLLLLFFFFFKK",
];
/** The near ear hangs from the side of the head and lags behind the bob. */
const EAR = { columns: 4, top: 5 };
const HEAD_X = 16;
const HEAD_Y = -33;

export type Cell = { x: number; y: number; color: string };

export class Cells {
  private map = new Map<string, Cell>();
  put(x: number, y: number, color: string) {
    if (color !== ".") this.map.set(`${x},${y}`, { x, y, color });
  }
  rect(x: number, y: number, width: number, height: number, color: string) {
    for (let j = 0; j < height; j++)
      for (let i = 0; i < width; i++) this.put(x + i, y + j, color);
  }
  /** Rectangle with stepped pixel corners. */
  blob(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    radius = 2,
  ) {
    for (let j = 0; j < height; j++) {
      const cut = Math.max(0, radius - j, radius - (height - 1 - j));
      for (let i = cut; i < width - cut; i++) this.put(x + i, y + j, color);
    }
  }
  ascii(
    rows: readonly string[],
    x: number,
    y: number,
    keep: (i: number, j: number) => boolean = () => true,
  ) {
    rows.forEach((row, j) =>
      [...row].forEach((color, i) => {
        if (keep(i, j)) this.put(x + i, y + j, color);
      }),
    );
  }
  get cells(): Cell[] {
    return [...this.map.values()];
  }
}

/** Paw offset (cells forward) and lift (cells above the path) for a frame. */
const STANCE = [3, 2, 1, 0, -1, -2];
const SWING = [-3, -2, -1, 0, 1, 2];
const LIFT = [1, 2, 2, 2, 2, 1];
export type Paw = { dx: number; lift: number };
export function pawAt(frame: number, phase: number): Paw {
  const k = (((frame + phase) % FRAMES) + FRAMES) % FRAMES;
  return k < STANCE.length
    ? { dx: STANCE[k], lift: 0 }
    : { dx: SWING[k - STANCE.length], lift: LIFT[k - STANCE.length] };
}

/** Body bob, tail wag and ear lag (cells) for a walking frame. */
export function poseAt(frame: number) {
  const beat = frame % (FRAMES / 2);
  return {
    bob: beat === 3 || beat === 4 ? -1 : 0,
    wag: Math.floor(frame / 3) % 2,
    // The ear stays low as the body rises and stays high as it drops back.
    ear: beat === 3 ? 1 : beat === 5 ? -1 : 0,
  };
}

const BODY_LEFT = 3;
const TURN_BODY_LEFT = 11;
const BODY_RIGHT = 36;
const RISE = -1; // one extra row of leg for a poodle stance

// Diagonal pairs swing together (near front with far hind).
export type Leg = {
  name: string;
  hip: (left: number) => number;
  far: boolean;
  phase: number;
};
export const LEGS: readonly Leg[] = [
  { name: "Far hind", hip: (left) => left + 7, far: true, phase: 0 },
  { name: "Far front", hip: () => 24, far: true, phase: FRAMES / 2 },
  { name: "Near hind", hip: (left) => left + 3, far: false, phase: FRAMES / 2 },
  { name: "Near front", hip: () => 27, far: false, phase: 0 },
];

/** A leg from under the body to the path; the hip stays, the paw moves. */
export function legCells(
  leg: Leg,
  { dx, lift }: Paw,
  left = BODY_LEFT,
  cells = new Cells(),
) {
  const hip = leg.hip(left);
  const top = -9;
  const bottom = -1 - lift;
  const span = bottom - top;
  for (let k = 0; k <= span; k++) {
    const y = top + k;
    // A raised paw tucks back by one cell.
    const x =
      hip + Math.round((dx * k) / span) - (lift > 1 && k >= span - 1 ? 1 : 0);
    if (leg.far) cells.rect(x, y, 5, 1, "K");
    else if (y >= bottom - 1) {
      cells.rect(x, y, 6, 1, "K"); // paw, toe forward
      if (y === bottom - 1) cells.rect(x + 1, y, 4, 1, "F");
    } else {
      cells.put(x, y, "K");
      cells.rect(x + 1, y, 3, 1, "F");
      cells.put(x + 3, y, "L"); // lit edge like the idle legs
      cells.put(x + 4, y, "K");
    }
  }
  return cells;
}

const TAIL_POM = [
  "..KKKK..",
  ".KKFFKK.",
  "KKFLLFKK",
  "KKFFFFKK",
  ".KKFFKK.",
  "..KKKK..",
];
export function tailPomCells(left = BODY_LEFT, cells = new Cells()) {
  cells.ascii(TAIL_POM, left - 4, RISE - 23);
  return cells;
}

/** Torso, tail stem and collar. Fluffy rump, raised back, chest under the head. */
export function bodyCells(left = BODY_LEFT, cells = new Cells()) {
  const y = RISE;
  const width = BODY_RIGHT - left;
  cells.rect(left + 1, y - 17, 2, 2, "K");
  cells.rect(left + 2, y - 15, 2, 2, "K"); // tail stem
  cells.blob(left, y - 19, width, 13, "K", 3);
  cells.blob(left + 1, y - 20, 12, 3, "K", 1);
  cells.blob(left + 2, y - 17, width - 4, 9, "F", 2);
  cells.blob(left + 3, y - 18, 8, 2, "F", 1);
  cells.rect(left + 4, y - 18, 6, 1, "L");
  cells.rect(left + 12, y - 17, 8, 1, "L");
  cells.rect(left + 3, y - 16, 2, 1, "L");
  cells.rect(left + 3, y - 13, 2, 3, "L"); // haunch
  cells.rect(left + 6, y - 8, width - 14, 1, "K"); // belly line
  cells.rect(21, y - 12, 16, 2, "K");
  cells.rect(23, y - 12, 12, 1, "R");
  cells.rect(29, y - 11, 2, 2, "Y");
  return cells;
}

const isEar = (i: number, j: number) => i < EAR.columns && j >= EAR.top;
// The head keeps the ear's root row, so a lowered ear leaves no gap under it.
const isEarRoot = (i: number, j: number) => i < EAR.columns && j === EAR.top;
export function headCells(cells = new Cells()) {
  cells.ascii(
    HEAD,
    HEAD_X,
    RISE + HEAD_Y,
    (i, j) => !isEar(i, j) || isEarRoot(i, j),
  );
  return cells;
}
export function earCells(cells = new Cells()) {
  cells.ascii(HEAD, HEAD_X, RISE + HEAD_Y, isEar);
  return cells;
}

export function frontCells() {
  const cells = new Cells();
  cells.ascii(FRONT, FRONT_ORIGIN[0], FRONT_ORIGIN[1]);
  return cells;
}

/** Halfway through the turn: a short body seen at an angle, legs together. */
export function turnCells() {
  const cells = new Cells();
  const still = { dx: 0, lift: 0 };
  for (const leg of LEGS.filter((leg) => leg.far))
    legCells(leg, still, TURN_BODY_LEFT, cells);
  tailPomCells(TURN_BODY_LEFT, cells);
  bodyCells(TURN_BODY_LEFT, cells);
  for (const leg of LEGS.filter((leg) => !leg.far))
    legCells(leg, still, TURN_BODY_LEFT, cells);
  headCells(cells);
  earCells(cells);
  return cells;
}

/**
 * Merge cells into rectangles per color, in scene units. Ink comes first as a
 * full silhouette under the other colors.
 */
export function colorRects(cells: readonly Cell[]) {
  const byColor = new Map<string, Cell[]>([["K", [...cells]]]);
  for (const cell of cells)
    if (cell.color !== "K")
      byColor.set(cell.color, [...(byColor.get(cell.color) ?? []), cell]);
  return [...byColor].map(([color, group]) => ({
    color: PALETTE[color],
    rects: mergeRuns(group).map(({ x, y, width, height }) => ({
      x: x * CELL,
      y: y * CELL,
      width: width * CELL,
      height: height * CELL,
    })),
  }));
}

/** Horizontal runs per row, stacked while consecutive rows repeat the run. */
type Run = { x: number; y: number; width: number; height: number };
function mergeRuns(cells: readonly Cell[]): Run[] {
  const rows = new Map<number, number[]>();
  for (const { x, y } of cells) rows.set(y, [...(rows.get(y) ?? []), x]);
  const result: Run[] = [];
  let open = new Map<string, Run>();
  for (const y of [...rows.keys()].sort((a, b) => a - b)) {
    const runs: { x: number; width: number }[] = [];
    for (const x of rows.get(y)!.sort((a, b) => a - b)) {
      const last = runs.at(-1);
      if (last && last.x + last.width === x) last.width++;
      else runs.push({ x, width: 1 });
    }
    const next = new Map<string, Run>();
    for (const run of runs) {
      const key = `${run.x}:${run.width}`;
      let rect = open.get(key);
      if (rect && rect.y + rect.height === y) rect.height++;
      else {
        rect = { ...run, y, height: 1 };
        result.push(rect);
      }
      next.set(key, rect);
    }
    open = next;
  }
  return result;
}
