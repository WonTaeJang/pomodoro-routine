import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Decode the approved reference with the sharp dependency shipped by Next.
// This builds native Rive rectangles, not a new or edited bitmap asset.
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const SOURCE = new URL(
  "../docs/references/kkami-walk-approved.png",
  import.meta.url,
);
const CELL = 4;
const SCALE = 0.64;
const TILE_WIDTH = 384;
const TOP = 696;
const HEIGHT = 280;
const PALETTE = [
  [36, 36, 42],
  [44, 44, 50],
  [56, 56, 64],
  [64, 64, 72],
  [76, 76, 84],
  [88, 88, 98],
  [248, 240, 218],
  [180, 180, 174],
  [232, 152, 120],
  [248, 168, 132],
  [232, 192, 72],
  [248, 208, 88],
];
function nearestColor(rgb) {
  let best = PALETTE[0],
    distance = Infinity;
  for (const candidate of PALETTE) {
    const next = rgb.reduce(
      (sum, value, channel) => sum + (value - candidate[channel]) ** 2,
      0,
    );
    if (next < distance) {
      best = candidate;
      distance = next;
    }
  }
  return best
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function backgroundCandidate(r, g, b) {
  return r > 140 && g > 130 && b > 110 && r - g < 40 && g - b < 50;
}

/** Preserve enclosed cream eyes; only remove ivory connected to the tile edge. */
function outsideMask(data, imageWidth, left) {
  const mask = new Uint8Array(TILE_WIDTH * HEIGHT);
  const queue = [];
  const visit = (x, y) => {
    if (x < 0 || x >= TILE_WIDTH || y < 0 || y >= HEIGHT) return;
    const at = y * TILE_WIDTH + x;
    if (mask[at]) return;
    const source = ((TOP + y) * imageWidth + left + x) * 3;
    if (!backgroundCandidate(data[source], data[source + 1], data[source + 2]))
      return;
    mask[at] = 1;
    queue.push(at);
  };
  for (let x = 0; x < TILE_WIDTH; x++) {
    visit(x, 0);
    visit(x, HEIGHT - 1);
  }
  for (let y = 0; y < HEIGHT; y++) {
    visit(0, y);
    visit(TILE_WIDTH - 1, y);
  }
  for (let at = 0; at < queue.length; at++) {
    const x = queue[at] % TILE_WIDTH,
      y = Math.floor(queue[at] / TILE_WIDTH);
    visit(x - 1, y);
    visit(x + 1, y);
    visit(x, y - 1);
    visit(x, y + 1);
  }
  return mask;
}

/** Horizontal runs, then vertical merging, preserve the silhouette with fewer shapes. */
function mergeCells(rows) {
  const rectangles = [];
  let previous = new Map();
  rows.forEach((row, y) => {
    const current = new Map();
    for (let x = 0; x < row.length;) {
      const color = row[x];
      if (color === null) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === color) end++;
      const key = `${x}:${end}:${color}`;
      const existing = previous.get(key);
      if (existing) existing.height++;
      const rectangle = existing ?? { x, y, width: end - x, height: 1, color };
      if (!existing) rectangles.push(rectangle);
      current.set(key, rectangle);
      x = end;
    }
    previous = current;
  });
  return rectangles;
}

export async function traceWalkPoses() {
  const { data, info } = await sharp(fileURLToPath(SOURCE))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width !== 1536 || info.height !== 1024 || info.channels !== 3) {
    throw new Error("The approved walk sheet must remain 1536x1024 RGB.");
  }
  return Array.from({ length: 4 }, (_, pose) => {
    const left = pose * TILE_WIDTH;
    const outside = outsideMask(data, info.width, left);
    let eyeSum = 0,
      eyeCount = 0,
      bottom = 0;
    const rows = [];
    for (let y = 0; y < HEIGHT; y += CELL) {
      const row = [];
      for (let x = 0; x < TILE_WIDTH; x += CELL) {
        const rgb = [0, 0, 0];
        let count = 0;
        for (let dy = 0; dy < CELL; dy++)
          for (let dx = 0; dx < CELL; dx++) {
            if (outside[(y + dy) * TILE_WIDTH + x + dx]) continue;
            const at = ((TOP + y + dy) * info.width + left + x + dx) * 3;
            for (let channel = 0; channel < 3; channel++)
              rgb[channel] += data[at + channel];
            if (
              y < 120 &&
              data[at] > 200 &&
              data[at + 1] > 190 &&
              data[at + 2] > 160
            ) {
              eyeSum += x + dx;
              eyeCount++;
            }
            count++;
          }
        if (count < (CELL * CELL) / 2) {
          row.push(null);
          continue;
        }
        bottom = y + CELL;
        // A compact source-matched palette removes texture without redrawing features.
        const hex = nearestColor(rgb.map((value) => value / count));
        row.push(hex);
      }
      rows.push(row);
    }
    if (!eyeCount) throw new Error(`No eye anchor in approved pose ${pose}`);
    const eyeX = Math.round(eyeSum / eyeCount / CELL) * CELL;
    return mergeCells(rows).map(({ x, y, width, height, color }) => ({
      x: (x * CELL - eyeX + 100) * SCALE,
      y: (y * CELL - bottom) * SCALE,
      width: width * CELL * SCALE,
      height: height * CELL * SCALE,
      color,
    }));
  });
}
