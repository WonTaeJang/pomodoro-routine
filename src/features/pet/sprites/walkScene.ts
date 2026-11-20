// 산책 장면(680×320단위): 방 안 러그 위의 정면 까미 → 돌아서기 → 바깥으로 걸어 나가 아이템 줍기
// → 집으로 → 바깥이 왼쪽으로 빠지며 다시 정면. 페이지가 방을 뒤에 그리고, 처음엔 바깥이
// 오른쪽에서 기다립니다. 풍경은 프레임마다 정확히 한 칸씩 움직여 번지지 않습니다.

import type { TimeOfDay } from "../roomArt";
import { TRIP } from "../walkTrip";
import { node, rect, type Scene, type SceneItem } from "../pixel/scene";
import {
  applySequence,
  clip,
  keys,
  override,
  sequenceFrame,
  sequenceStarts,
  showOnly,
  type Clip,
  type Key,
  type Override,
  type Pose,
  type Track,
} from "../pixel/timeline";
import {
  CELL,
  FPS,
  FRAMES,
  FRONT_FRAMES,
  TURN_FRAMES,
  LEGS,
  pawAt,
  poseAt,
  legCells,
  tailPomCells,
  bodyCells,
  headCells,
  earCells,
  frontCells,
  turnCells,
  colorRects,
  type Cells,
} from "./walkSprite";

/** The trip in frames at FPS, from the page's TRIP (ms). */
const TRIP_FRAMES = {
  toSpot: (TRIP.toSpot * FPS) / 1000,
  pick: (TRIP.pick * FPS) / 1000,
  toHome: (TRIP.toHome * FPS) / 1000,
  arrive: (TRIP.arrive * FPS) / 1000,
};

// Scene units, shown at the home scale (1 unit = 1px, 1.2px from the sm
// breakpoint) so both scenes share one dot size. A multiple of 40 keeps the
// centre on the cell grid and the 1.2x canvas a whole pixel size.
export const WALK_WIDTH = 680;
// Tall enough to cover the home room (316px on phones) once outside.
export const WALK_HEIGHT = 320;
const GROUND = 268; // paw line, the same height above the floor as at home
// The head stays where the home head is: centred, so the body trails behind.
const DOG_X = WALK_WIDTH / 2 - 30 * CELL;
const FRONT_X = WALK_WIDTH / 2;
const FRONT_Y = GROUND - 19 * CELL; // home idle paws are 19 cells below its origin

/** One rectangle list per color; the ink silhouette lies underneath. */
const pixels = (cells: Cells): SceneItem[] =>
  colorRects(cells.cells).flatMap(({ color, rects }) =>
    rects.map(({ x, y, width, height }) => rect(x, y, width, height, color)),
  );
/** Hold keys only where the value changes. */
const steps = (values: readonly number[]): Key[] =>
  values.flatMap((value, frame): Key[] =>
    frame === 0 || value !== values[frame - 1] ? [[frame, value]] : [],
  );
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// --- Kkami -----------------------------------------------------------------
const STANDING = FRAMES; // extra leg pose: all paws down, used while picking up
const legPoseId = (legIndex: number, pose: number) => `leg${legIndex}:${pose}`;
const legNodes = LEGS.map((leg, legIndex) => ({
  leg,
  node: node(
    undefined,
    [...range(FRAMES), STANDING].map((pose) =>
      node(
        legPoseId(legIndex, pose),
        pixels(
          legCells(
            leg,
            pose === STANDING ? { dx: 0, lift: 0 } : pawAt(pose, leg.phase),
          ),
        ),
        { opacity: pose === 0 ? 1 : 0 },
      ),
    ),
  ),
}));
const walker = node(
  "walker",
  [
    ...legNodes.filter(({ leg }) => leg.far).map(({ node }) => node),
    node("body", [
      node("tail", pixels(tailPomCells())),
      ...pixels(bodyCells()),
    ]),
    ...legNodes.filter(({ leg }) => !leg.far).map(({ node }) => node),
    node("head", [...pixels(headCells()), node("ear", pixels(earCells()))]),
  ],
  { opacity: 0 },
);
const dog = node(
  "dog",
  [
    node("front", pixels(frontCells()), {
      x: FRONT_X - DOG_X,
      y: FRONT_Y - GROUND,
    }),
    node("turning", pixels(turnCells()), { opacity: 0 }),
    walker,
  ],
  { x: DOG_X, y: GROUND },
);

/** Which of the three Kkami drawings shows. */
const show = (part: "front" | "turning" | "walker") => [
  ...keys("front", { opacity: [[0, part === "front" ? 1 : 0]] }),
  ...keys("turning", { opacity: [[0, part === "turning" ? 1 : 0]] }),
  ...keys("walker", { opacity: [[0, part === "walker" ? 1 : 0]] }),
];
/** Leg pose per frame (a walk-cycle frame or STANDING), as opacity keys. */
const legKeys = (posePerFrame: readonly number[]) =>
  LEGS.flatMap((_, legIndex) =>
    [...range(FRAMES), STANDING].flatMap((pose) =>
      keys(legPoseId(legIndex, pose), {
        opacity: steps(posePerFrame.map((p) => (p === pose ? 1 : 0))),
      }),
    ),
  );
/** Walk-cycle keys for a run of frames (the cycle repeats every FRAMES). */
const gait = (frames: number) => {
  const cycle = range(frames).map((frame) => frame % FRAMES);
  const track = (field: "bob" | "wag" | "ear") =>
    steps(cycle.map((frame) => poseAt(frame)[field] * CELL));
  return [
    ...legKeys(cycle),
    ...keys("body", { y: track("bob") }),
    ...keys("head", { y: track("bob") }),
    ...keys("tail", { x: track("wag") }),
    ...keys("ear", { y: track("ear") }),
  ];
};

const START = FRONT_FRAMES + TURN_FRAMES;
const start = [
  ...keys("front", {
    opacity: [
      [0, 1],
      [FRONT_FRAMES, 0],
    ],
  }),
  ...keys("turning", {
    opacity: [
      [0, 0],
      [FRONT_FRAMES, 1],
    ],
  }),
  ...keys("walker", { opacity: [[0, 0]] }),
];
// The find twinkles on the path ahead until Kkami's mouth reaches it.
const twinkle = (frames: number) =>
  keys("glint", {
    opacity: steps(range(frames).map((f) => (Math.floor(f / 3) % 2 ? 1 : 0))),
  });
const walkOut = [
  ...show("walker"),
  ...gait(TRIP_FRAMES.toSpot),
  ...keys("find", { opacity: [[0, 1]] }),
  ...twinkle(TRIP_FRAMES.toSpot),
];
// Stop, sniff twice, lower the head to take it, look up with a quick wag.
const GRAB = 11;
const pick = [
  ...show("walker"),
  ...legKeys(range(TRIP_FRAMES.pick).map(() => STANDING)),
  ...keys("body", { y: [[0, 0]] }),
  ...keys("head", {
    y: [
      [0, 0],
      [3, CELL],
      [5, 0],
      [7, CELL],
      [9, 0],
      [GRAB, 2 * CELL],
      [15, CELL],
      [17, 0],
    ],
  }),
  ...keys("ear", {
    y: [
      [0, 0],
      [3, -CELL],
      [5, 0],
      [7, -CELL],
      [9, 0],
      [GRAB, -CELL],
      [15, 0],
    ],
  }),
  ...keys("tail", {
    x: steps(
      range(TRIP_FRAMES.pick).map((f) => (f >= GRAB && f % 2 ? CELL : 0)),
    ),
  }),
  ...keys("find", {
    opacity: [
      [0, 1],
      [GRAB, 0],
    ],
  }),
  ...twinkle(GRAB),
];
const walkHome = [
  ...show("walker"),
  ...gait(TRIP_FRAMES.toHome),
  ...keys("find", { opacity: [[0, 0]] }),
];
// Keep walking while the outdoors slides away, then turn to face you.
const TURN_AT = TRIP_FRAMES.arrive - TURN_FRAMES;
const arrive = [
  ...gait(TURN_AT),
  ...keys("walker", {
    opacity: [
      [0, 1],
      [TURN_AT, 0],
    ],
  }),
  ...keys("turning", {
    opacity: [
      [0, 0],
      [TURN_AT, 1],
      [TRIP_FRAMES.arrive, 0],
    ],
  }),
  ...keys("front", {
    opacity: [
      [0, 0],
      [TRIP_FRAMES.arrive, 1],
    ],
  }),
];

// --- Scenery (4-unit grid; each layer steps a whole cell per frame) ---------
type Tint = (color: string) => string;
const tree = (x: number, y: number, dark = false, tint: Tint = (c) => c) => {
  const paint = (x0: number, y0: number, w: number, h: number, color: string) =>
    rect(x0, y0, w, h, tint(color));
  const leaf = dark ? "7F9E77" : "9CB28B";
  return [
    paint(x + 32, y + 64, 12, 56, "98856B"),
    paint(x + 40, y + 72, 4, 48, "7E705D"),
    paint(x + 8, y + 20, 64, 64, leaf),
    paint(x + 20, y + 4, 40, 92, leaf),
    paint(x, y + 36, 80, 32, leaf),
    paint(x + 16, y + 24, 12, 16, dark ? "9DB88D" : "B6C79E"),
    paint(x + 28, y + 12, 24, 8, dark ? "9DB88D" : "B6C79E"),
    paint(x + 56, y + 52, 16, 24, dark ? "6D8F68" : "8CA27E"),
  ];
};
const cloud = (x: number, y: number) => [
  rect(x, y + 8, 64, 12, "F7F6E9"),
  rect(x + 12, y, 32, 24, "F7F6E9"),
];
const CLOUD_DRIFT = 640; // one slow pass, longer than any walk
const PATH_TILE = 160; // path details repeat every 160 units
// The path moves a cell per walking frame and stands still while picking up;
// trees pass at half that speed.
const PATH_OUT = TRIP_FRAMES.toSpot * CELL;
const PATH_TRIP =
  (TRIP_FRAMES.toSpot + TRIP_FRAMES.toHome + TRIP_FRAMES.arrive) * CELL;
const TREES_TRIP = PATH_TRIP / 2;
// Only scenery that stays inside the outdoors panel for the whole trip: as the
// panel slides away, nothing may hang past its right edge over the room.
const trees = (
  [
    [24, GROUND - 164, false],
    [204, GROUND - 176, true],
    [472, GROUND - 156, false],
    [664, GROUND - 164, false],
  ] as const
).filter(([x]) => x + 80 <= WALK_WIDTH + TREES_TRIP);
const clouds = [...cloud(80, 60), ...cloud(392, 40)];
const path: SceneItem[] = [];
// Path details stop where the panel starts to slide away (see the trees).
const PATH_BEFORE_ARRIVAL = (TRIP_FRAMES.toSpot + TRIP_FRAMES.toHome) * CELL;
for (
  let x = 0;
  x + PATH_TILE / 2 <= WALK_WIDTH + PATH_BEFORE_ARRIVAL;
  x += PATH_TILE / 2
) {
  path.push(
    rect(x + 12, GROUND - 36, 4, 12, "7E9C6D"), // grass tuft at the path edge
    rect(x + 8, GROUND - 32, 12, 4, "7E9C6D"),
    rect(x + 36, GROUND + 24, 16, 4, "D6BD97"), // dashes in the dirt
  );
  if (x % PATH_TILE === 0)
    path.push(
      rect(x + 60, GROUND + 40, 4, 8, "829B70"), // flower on the verge
      rect(x + 56, GROUND + 36, 12, 8, "F4E7BB"),
      rect(x + 60, GROUND + 36, 4, 4, "DDBA70"),
    );
}
// The find lies on the path so it reaches Kkami's nose exactly as he stops.
const NOSE_X = DOG_X + 42 * CELL;
/** The find's dots, in cells. */
const dot = (x: number, y: number, w: number, h: number, color: string) =>
  rect(x * CELL, y * CELL, w * CELL, h * CELL, color);
path.push(
  node(
    "find",
    [
      dot(-2, 0, 5, 1, "F2C94C"),
      dot(0, -2, 1, 5, "F2C94C"),
      dot(0, 0, 1, 1, "FFF6DD"),
      node("glint", [dot(2, -3, 1, 1, "FFF6DD")], { opacity: 0 }),
    ],
    { x: NOSE_X + PATH_OUT, y: GROUND - 3 * CELL, opacity: 0 },
  ),
);
// The outdoors slides in from the right as he sets off, 68 units (17 cells)
// a frame, and away to the left as he gets home.
const SLIDE = 10;
// The sky follows the device clock like the home window: dawn, day, dusk and
// night. Each has its own sky; the ground below gets a light shade instead.
// Sun and moon stay in the middle: phones show only units ~150–530.
const SKY_BOTTOM = GROUND - 100; // the meadow covers the sky from here
const TIMES = ["day", "dawn", "dusk", "night"] as const satisfies TimeOfDay[];
const bands = (colors: readonly string[]) =>
  colors.map((color, i) =>
    rect(
      0,
      i * 44,
      WALK_WIDTH,
      i === colors.length - 1 ? WALK_HEIGHT : 44,
      color,
    ),
  );
const SKIES: Record<TimeOfDay, SceneItem[]> = {
  day: [
    rect(0, 0, WALK_WIDTH, WALK_HEIGHT, "DCE9E4"),
    rect(468, 52, 32, 32, "F7EDC7"),
  ],
  dawn: [
    ...bands(["B9B6D8", "D8C3D6", "F0D3C8", "F7E3C8"]),
    rect(200, SKY_BOTTOM - 16, 48, 16, "F6C27A"), // rising sun
    rect(208, SKY_BOTTOM - 24, 32, 8, "F6C27A"),
    rect(476, 44, 12, 12, "ECE8F4"), // the moon, fading
  ],
  dusk: [
    ...bands(["A99FCB", "D9A3AE", "EDB291", "F5CC96"]),
    rect(452, SKY_BOTTOM - 56, 40, 40, "EF9A5C"), // setting sun
    rect(452, SKY_BOTTOM - 56, 40, 12, "F4B074"),
    rect(400, 76, 96, 4, "F4C2AC"),
  ],
  night: [
    ...bands(["283152", "2E3859", "343F62", "3B476B"]),
    ...(
      [
        [480, 44, 12, 4],
        [472, 48, 12, 4],
        [468, 52, 8, 16],
        [472, 68, 12, 4],
        [480, 72, 12, 4],
      ] as const
    ).map(([x, y, w, h]) => rect(x, y, w, h, "F3E7B5")), // crescent moon
    ...(
      [
        [84, 36],
        [196, 88],
        [300, 28],
        [404, 72],
        [620, 104],
        [28, 120],
      ] as const
    ).map(([x, y]) => rect(x, y, 4, 4, "FDF6D8")), // stars
  ],
};
/** A see-through colour over the ground: hex color and alpha (00–ff). */
type Shade = { color: string; alpha: string };
const SHADES: Record<Exclude<TimeOfDay, "day">, Shade> = {
  dawn: { color: "8E9AC2", alpha: "2E" },
  dusk: { color: "E0875A", alpha: "29" },
  night: { color: "1E2747", alpha: "73" },
};
/** A colour seen through a shade: the same mix the ground gets. */
const through =
  ({ color, alpha }: Shade): Tint =>
  (base) => {
    const a = parseInt(alpha, 16) / 255;
    return [0, 2, 4]
      .map((i) => {
        const mix =
          parseInt(base.slice(i, i + 2), 16) * (1 - a) +
          parseInt(color.slice(i, i + 2), 16) * a;
        return Math.round(mix).toString(16).padStart(2, "0");
      })
      .join("");
  };
const skyId = (time: TimeOfDay) => `sky:${time}`;
const shadeId = (time: TimeOfDay) => `shade:${time}`;
const treesId = (time: TimeOfDay) => `trees:${time}`;
const outdoors = [
  ...TIMES.map((time) =>
    node(skyId(time), SKIES[time], { opacity: time === "day" ? 1 : 0 }),
  ),
  node("clouds", clouds),
  rect(0, GROUND - 100, WALK_WIDTH, 76, "B7C9A2"), // meadow
  rect(0, GROUND - 60, WALK_WIDTH, 20, "A8BE92"),
  rect(0, GROUND - 24, WALK_WIDTH, 64, "E8D5B5"), // path
  rect(0, GROUND - 24, WALK_WIDTH, 4, "D4C29E"),
  rect(0, GROUND + 36, WALK_WIDTH, 4, "CFB993"),
  rect(0, GROUND + 40, WALK_WIDTH, WALK_HEIGHT - GROUND - 40, "B7C9A2"), // verge
  node("path", path),
  rect(DOG_X + 5 * CELL, GROUND, 34 * CELL, CELL, "CBB38F"), // Kkami's shadow
  ...(Object.entries(SHADES) as [TimeOfDay, Shade][]).map(([time, shade]) =>
    node(
      shadeId(time),
      [
        rect(
          0,
          SKY_BOTTOM,
          WALK_WIDTH,
          WALK_HEIGHT - SKY_BOTTOM,
          `${shade.color}${shade.alpha}`,
        ),
      ],
      { opacity: 0 },
    ),
  ),
  // Above the shade: each time has its own tinted trees. They end above the path.
  node(
    "trees",
    TIMES.map((time) =>
      node(
        treesId(time),
        trees.flatMap(([x, y, dark]) =>
          tree(x, y, dark, time === "day" ? undefined : through(SHADES[time])),
        ),
        { opacity: time === "day" ? 1 : 0 },
      ),
    ),
  ),
];

export const WALK_SCENE: Scene = {
  width: WALK_WIDTH,
  height: WALK_HEIGHT,
  items: [node("outdoors", outdoors, { x: WALK_WIDTH }), dog],
};

// --- Timeline -----------------------------------------------------------------
// Layers play side by side; each plays its clips one after another.
const part = (frames: number, tracks: Track[] = [], fps = FPS): Clip =>
  clip({ fps, frames }, tracks);
/** A clip sliding a node from `from` to `to` (scene units), a step a frame. */
const glide = (
  target: string,
  frames: number,
  [from, to]: [number, number],
  fps = FPS,
) =>
  part(
    frames,
    keys(
      target,
      {
        x: [
          [0, from],
          [frames, to],
        ],
      },
      "linear",
    ),
    fps,
  );
/** A clip keeping a node at `x`. */
const stay = (target: string, frames: number, x: number, fps = FPS) =>
  part(frames, keys(target, { x: [[0, x]] }), fps);

// Scenery waits out the front pose and turn: it moves only once Kkami walks.
const pause = part(START);
const { toSpot, pick: picking, toHome, arrive: arriving } = TRIP_FRAMES;
const TREES_STOP = (-toSpot / 2) * CELL; // the trees stop with the path
export const WALK_LAYERS = {
  kkami: [
    part(START, start),
    part(toSpot, walkOut),
    part(picking, pick),
    part(toHome, walkHome),
    part(arriving, arrive),
  ],
  outdoors: [
    pause,
    glide("outdoors", SLIDE, [WALK_WIDTH, 0]),
    stay("outdoors", toSpot + picking + toHome - SLIDE, 0),
    glide("outdoors", SLIDE, [0, -WALK_WIDTH]),
  ],
  path: [
    pause,
    glide("path", toSpot, [0, -PATH_OUT]),
    stay("path", picking, -PATH_OUT),
    glide("path", toHome + arriving, [-PATH_OUT, -PATH_TRIP]),
  ],
  // Trees pass at half the path speed: a cell every other frame.
  trees: [
    pause,
    glide("trees", toSpot / 2, [0, TREES_STOP], FPS / 2),
    stay("trees", picking / 2, TREES_STOP, FPS / 2),
    glide("trees", (toHome + arriving) / 2, [TREES_STOP, -TREES_TRIP], FPS / 2),
  ],
  // Clouds drift on their own, a cell every six frames.
  clouds: [
    pause,
    glide("clouds", CLOUD_DRIFT / CELL, [0, -CLOUD_DRIFT], FPS / 6),
  ],
} satisfies Record<string, Clip[]>;

/** Kkami's first step, in ms from the start: the page starts its trip clock. */
export const WALK_STEP_MS = sequenceStarts(WALK_LAYERS.kkami)[1];

/** The sky, ground shade and tree colors for the time of day; no clouds at night. */
const timePose = (time: TimeOfDay): Override[] => [
  ...showOnly(TIMES.map(skyId), skyId(time)),
  ...showOnly(TIMES.filter((t) => t !== "day").map(shadeId), shadeId(time)),
  ...showOnly(TIMES.map(treesId), treesId(time)),
  ["clouds", { opacity: time === "night" ? 0 : 1 }],
];

/** The walk `ms` after it starts, under the sky of `time`. */
export function walkPose(ms: number, time: TimeOfDay): Pose {
  const pose: Pose = new Map();
  for (const layer of Object.values(WALK_LAYERS))
    applySequence(pose, layer, ms);
  return override(pose, timePose(time));
}

/** Changes exactly when `walkPose` would draw something new. */
export function walkFrameKey(ms: number, time: TimeOfDay): string {
  const layers = Object.values(WALK_LAYERS).map((layer) =>
    sequenceFrame(layer, ms),
  );
  return `${time}|${layers.join("|")}`;
}
