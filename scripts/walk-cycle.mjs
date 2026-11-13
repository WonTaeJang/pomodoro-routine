// Coordinates are Rive artboard units. Keep the path and planted paws in sync.
export const WALK_FPS = 16;
export const WALK_SECONDS = 1;
export const PATH_SPEED = 64;
export const STANCE = 0.6;
export const LIFT = 12;
export const LEG_ROOT = -51.2;

export const LEGS = [
  {
    name: "Far hind",
    left: -56.32,
    right: -10.24,
    foot: -29.44,
    hip: -36,
    phase: 0.75,
  },
  {
    name: "Far front",
    left: -10.24,
    right: 33.28,
    foot: 12.8,
    hip: 20,
    phase: 0.5,
  },
  {
    name: "Near hind",
    left: -Infinity,
    right: -56.32,
    foot: -76.8,
    hip: -60,
    phase: 0.25,
  },
  {
    name: "Near front",
    left: 33.28,
    right: Infinity,
    foot: 65.28,
    hip: 44,
    phase: 0,
  },
];

export function footAt(seconds, phase = 0) {
  const p = (((seconds / WALK_SECONDS + phase) % 1) + 1) % 1;
  const stride = PATH_SPEED * WALK_SECONDS * STANCE;
  const half = stride / 2;
  if (p < STANCE)
    return { x: half - PATH_SPEED * p * WALK_SECONDS, y: 0, planted: true };
  const u = (p - STANCE) / (1 - STANCE);
  // Match stance velocity at toe-off and touchdown; the arc returns over the ground.
  const tangent = -PATH_SPEED * WALK_SECONDS * (1 - STANCE);
  const x =
    (2 * u ** 3 - 3 * u ** 2 + 1) * -half +
    (u ** 3 - 2 * u ** 2 + u) * tangent +
    (-2 * u ** 3 + 3 * u ** 2) * half +
    (u ** 3 - u ** 2) * tangent;
  return { x, y: -LIFT * Math.sin(Math.PI * u) ** 2, planted: false };
}

export function clipRect(rect, left, top, right, bottom) {
  const x = Math.max(rect.x, left),
    y = Math.max(rect.y, top);
  const r = Math.min(rect.x + rect.width, right),
    b = Math.min(rect.y + rect.height, bottom);
  return r > x && b > y ? { ...rect, x, y, width: r - x, height: b - y } : null;
}

/** Bend the original pixel bands, keeping the hip edge fixed and the sole on its arc. */
export function deformBand(rect, leg, seconds) {
  const foot = footAt(seconds, leg.phase);
  const weight = (y) => Math.max(0, Math.min(1, (y - LEG_ROOT) / -LEG_ROOT));
  const topWeight = weight(rect.y),
    bottomWeight = weight(rect.y + rect.height);
  const y = rect.y + foot.y * topWeight;
  return {
    ...rect,
    x: rect.x + (leg.hip + foot.x - leg.foot) * bottomWeight,
    y,
    height: rect.height + foot.y * (bottomWeight - topWeight),
  };
}

export function buildWalkRig(reference) {
  const body = reference
    .map((r) => clipRect(r, -Infinity, -Infinity, Infinity, LEG_ROOT))
    .filter(Boolean);
  const legs = LEGS.map((leg) => {
    const bands = [];
    for (const rect of reference) {
      // Short bands bend the leg silhouette; no newly drawn paws or face geometry.
      for (let band = 0; band < Math.ceil(-LEG_ROOT / 2.56); band++) {
        const y = LEG_ROOT + band * 2.56;
        const part = clipRect(
          rect,
          leg.left,
          y,
          leg.right,
          Math.min(0, y + 2.56),
        );
        if (part) bands.push(part);
      }
    }
    return { ...leg, bands };
  });
  return { body, legs };
}
