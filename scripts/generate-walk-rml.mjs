import { writeFileSync } from "node:fs";
import { rect, node, keys } from "./rml.mjs";
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
} from "./walk-sprite.mjs";

// The trip timeline in frames at FPS. Matches TRIP in src/features/pet/walkTrip.ts.
const TRIP = { toSpot: 36, pick: 18, toHome: 24, arrive: 12 };

// A separate scene keeps the walk out of the first home download.
// One walk: front pose → turn → out to a find (A → B) → pick it up → home
// (B → C) → the outdoors slides away and Kkami faces you again.
// Stable RML identities. Preserve the numbers when adding or rearranging artwork.
const ID = {
  board: 2,
  style: 5,
  machine: 7,
  dog: 24,
  front: 25,
  turning: 26,
  walker: 27,
  body: 28,
  tail: 29,
  head: 30,
  ear: 31,
  trees: 32,
  path: 33,
  clouds: 34,
  outdoors: 35,
  sparkle: 36,
  sparkleSmall: 37,
  model: 40,
  instance: 41,
  ready: 42,
  walkStarted: 43,
  // Time of day: a sky per time and a shade over the ground (I-054).
  skyDay: 44,
  skyDawn: 45,
  skyDusk: 46,
  skyNight: 47,
  shadeDawn: 48,
  shadeDusk: 49,
  shadeNight: 50,
  isDawn: 51,
  isDusk: 52,
  isNight: 53,
  treesDay: 54,
  treesDawn: 55,
  treesDusk: 56,
  treesNight: 57,
  legBase: 100, // + leg * 16 + pose (pose 12 = standing still)
  // State machine: layers, states and animations.
  layerBase: 200,
  stateBase: 300,
  animationBase: 400,
};

// Artboard units. The page shows them at the home scale (1 unit = 1px, 1.2px
// from the sm breakpoint) so both scenes share one pixel size. A multiple of 40
// keeps the centre on the cell grid and the 1.2x canvas a whole pixel size.
const WIDTH = 680;
// Tall enough to cover the home room (316px on phones) once outside.
const HEIGHT = 320;
const GROUND = 268; // paw line, the same height above the floor as at home
// The head stays where the home head is: centred, so the body trails behind.
const DOG_X = WIDTH / 2 - 30 * CELL;
const FRONT_X = WIDTH / 2;
const FRONT_Y = GROUND - 19 * CELL; // home idle paws are 19 cells below its origin

/** One compound path per color; the ink silhouette is drawn underneath. */
const pixels = (cells) =>
  colorRects(cells.cells).map(
    ({ color, rects }) =>
      `<Shape>${rects.map(({ x, y, width, height }) => `<Rectangle x="${x}" y="${y}" width="${width}" height="${height}" originX="0" originY="0"/>`).join("")}<Fill fillRule="nonZero"><SolidColor colorValue="FF${color}"/></Fill></Shape>`,
  );
/** Hold keys only where the value changes. */
const steps = (values) =>
  values.flatMap((value, frame) =>
    frame === 0 || value !== values[frame - 1] ? [[frame, value]] : [],
  );
const range = (n) => Array.from({ length: n }, (_, i) => i);

// --- Kkami -----------------------------------------------------------------
const STANDING = FRAMES; // extra leg pose: all paws down, used while picking up
const legNodes = LEGS.map((leg, legIndex) => {
  const poses = [...range(FRAMES), STANDING].map((pose) =>
    node(
      pose === STANDING ? `${leg.name} standing` : `${leg.name} ${pose + 1}`,
      ID.legBase + legIndex * 16 + pose,
      pixels(
        legCells(
          leg,
          pose === STANDING ? { dx: 0, lift: 0 } : pawAt(pose, leg.phase),
        ),
      ),
      pose === 0 ? "" : 'opacity="0"',
    ),
  );
  return { leg, node: node(leg.name, ID.legBase + legIndex * 16 + 15, poses) };
});
const walker = node(
  "Walking Kkami",
  ID.walker,
  [
    ...legNodes.filter(({ leg }) => leg.far).map(({ node }) => node),
    node("Body", ID.body, [
      node("Tail pom", ID.tail, pixels(tailPomCells())),
      ...pixels(bodyCells()),
    ]),
    ...legNodes.filter(({ leg }) => !leg.far).map(({ node }) => node),
    node("Head", ID.head, [
      ...pixels(headCells()),
      node("Near ear", ID.ear, pixels(earCells())),
    ]),
  ],
  'opacity="0"',
);
const dog = node(
  "Kkami",
  ID.dog,
  [
    node(
      "Front Kkami",
      ID.front,
      pixels(frontCells()),
      `x="${FRONT_X - DOG_X}" y="${FRONT_Y - GROUND}"`,
    ),
    node("Turning Kkami", ID.turning, pixels(turnCells()), 'opacity="0"'),
    walker,
  ],
  `x="${DOG_X}" y="${GROUND}"`,
);

/** Which of the three Kkami drawings shows. */
const show = (part) => [
  keys(ID.front, { opacity: [[0, part === "front" ? 1 : 0]] }),
  keys(ID.turning, { opacity: [[0, part === "turning" ? 1 : 0]] }),
  keys(ID.walker, { opacity: [[0, part === "walker" ? 1 : 0]] }),
];
/** Leg pose per frame (a walk-cycle frame or STANDING), as opacity keys. */
const legKeys = (poseAt) =>
  LEGS.flatMap((_, legIndex) =>
    [...range(FRAMES), STANDING].map((pose) =>
      keys(ID.legBase + legIndex * 16 + pose, {
        opacity: steps(poseAt.map((p) => (p === pose ? 1 : 0))),
      }),
    ),
  );
/** Walk-cycle keys for a run of frames (the cycle repeats every FRAMES). */
const gait = (frames) => {
  const cycle = range(frames).map((frame) => frame % FRAMES);
  const track = (field) =>
    steps(cycle.map((frame) => poseAt(frame)[field] * CELL));
  return [
    ...legKeys(cycle),
    keys(ID.body, { y: track("bob") }),
    keys(ID.head, { y: track("bob") }),
    keys(ID.tail, { x: track("wag") }),
    keys(ID.ear, { y: track("ear") }),
  ];
};

const START = FRONT_FRAMES + TURN_FRAMES;
const start = [
  keys(ID.front, {
    opacity: [
      [0, 1],
      [FRONT_FRAMES, 0],
    ],
  }),
  keys(ID.turning, {
    opacity: [
      [0, 0],
      [FRONT_FRAMES, 1],
    ],
  }),
  keys(ID.walker, { opacity: [[0, 0]] }),
];
// The find twinkles on the path ahead until Kkami's mouth reaches it.
const twinkle = (frames) =>
  keys(ID.sparkleSmall, {
    opacity: steps(range(frames).map((f) => (Math.floor(f / 3) % 2 ? 1 : 0))),
  });
const walkOut = [
  ...show("walker"),
  ...gait(TRIP.toSpot),
  keys(ID.sparkle, { opacity: [[0, 1]] }),
  twinkle(TRIP.toSpot),
];
// Stop, sniff twice, lower the head to take it, look up with a quick wag.
const GRAB = 11;
const pick = [
  ...show("walker"),
  ...legKeys(range(TRIP.pick).map(() => STANDING)),
  keys(ID.body, { y: [[0, 0]] }),
  keys(ID.head, {
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
  keys(ID.ear, {
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
  keys(ID.tail, {
    x: steps(range(TRIP.pick).map((f) => (f >= GRAB && f % 2 ? CELL : 0))),
  }),
  keys(ID.sparkle, {
    opacity: [
      [0, 1],
      [GRAB, 0],
    ],
  }),
  twinkle(GRAB),
];
const walkHome = [
  ...show("walker"),
  ...gait(TRIP.toHome),
  keys(ID.sparkle, { opacity: [[0, 0]] }),
];
// Keep walking while the outdoors slides away, then turn to face you.
const TURN_AT = TRIP.arrive - TURN_FRAMES;
const arrive = [
  ...gait(TURN_AT),
  keys(ID.walker, {
    opacity: [
      [0, 1],
      [TURN_AT, 0],
    ],
  }),
  keys(ID.turning, {
    opacity: [
      [0, 0],
      [TURN_AT, 1],
      [TRIP.arrive, 0],
    ],
  }),
  keys(ID.front, {
    opacity: [
      [0, 0],
      [TRIP.arrive, 1],
    ],
  }),
];

// --- Scenery (4-unit grid; each layer steps a whole cell per frame) ---------
const tree = (x, y, dark = false, tint = (color) => color) => {
  const paint = (x0, y0, w, h, color) => rect(x0, y0, w, h, tint(color));
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
const cloud = (x, y) => [
  rect(x, y + 8, 64, 12, "F7F6E9"),
  rect(x + 12, y, 32, 24, "F7F6E9"),
];
const CLOUD_DRIFT = 640; // one slow pass, longer than any walk
const PATH_TILE = 160; // path details repeat every 160 units
const trees = [];
const clouds = [];
// The path moves a cell per walking frame and stands still while picking up;
// trees pass at half that speed.
const PATH_OUT = TRIP.toSpot * CELL;
const PATH_TRIP = (TRIP.toSpot + TRIP.toHome + TRIP.arrive) * CELL;
const TREES_TRIP = PATH_TRIP / 2;
// Only scenery that stays inside the outdoors panel for the whole trip: as the
// panel slides away, nothing may hang past its right edge over the room.
for (const [x, y, dark] of [
  [24, GROUND - 164],
  [204, GROUND - 176, true],
  [472, GROUND - 156],
  [664, GROUND - 164],
]) {
  if (x + 80 <= WIDTH + TREES_TRIP) trees.push([x, y, dark]);
}
clouds.push(...cloud(80, 60), ...cloud(392, 40));
const path = [];
// Path details stop where the panel starts to slide away (see the trees).
const PATH_BEFORE_ARRIVAL = (TRIP.toSpot + TRIP.toHome) * CELL;
for (
  let x = 0;
  x + PATH_TILE / 2 <= WIDTH + PATH_BEFORE_ARRIVAL;
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
const sparkleRect = (x, y, w, h, color) =>
  rect(x * CELL, y * CELL, w * CELL, h * CELL, color);
path.push(
  node(
    "Find",
    ID.sparkle,
    [
      sparkleRect(-2, 0, 5, 1, "F2C94C"),
      sparkleRect(0, -2, 1, 5, "F2C94C"),
      sparkleRect(0, 0, 1, 1, "FFF6DD"),
      node(
        "Find glint",
        ID.sparkleSmall,
        [sparkleRect(2, -3, 1, 1, "FFF6DD")],
        'opacity="0"',
      ),
    ],
    `x="${NOSE_X + PATH_OUT}" y="${GROUND - 3 * CELL}" opacity="0"`,
  ),
);
// The outdoors waits off to the right while Kkami stands in the home room (the
// page draws the room behind the transparent canvas), slides in as he sets
// off, and slides away to the left as he gets home.
const SLIDE = 10; // frames, 68 units (17 cells) each
// The sky follows the device clock like the home window: dawn, day, dusk and
// night. Each has its own sky; the ground below gets a light shade instead.
// Sun and moon stay in the middle: phones show only units ~150–530.
const SKY_BOTTOM = GROUND - 100; // the meadow covers the sky from here
const bands = (colors) =>
  colors.map((color, i) =>
    rect(0, i * 44, WIDTH, i === colors.length - 1 ? HEIGHT : 44, color),
  );
const SKIES = {
  day: {
    id: ID.skyDay,
    art: [rect(0, 0, WIDTH, HEIGHT, "DCE9E4"), rect(468, 52, 32, 32, "F7EDC7")],
  },
  dawn: {
    id: ID.skyDawn,
    art: [
      ...bands(["B9B6D8", "D8C3D6", "F0D3C8", "F7E3C8"]),
      rect(200, SKY_BOTTOM - 16, 48, 16, "F6C27A"), // rising sun
      rect(208, SKY_BOTTOM - 24, 32, 8, "F6C27A"),
      rect(476, 44, 12, 12, "ECE8F4"), // the moon, fading
    ],
  },
  dusk: {
    id: ID.skyDusk,
    art: [
      ...bands(["A99FCB", "D9A3AE", "EDB291", "F5CC96"]),
      rect(452, SKY_BOTTOM - 56, 40, 40, "EF9A5C"), // setting sun
      rect(452, SKY_BOTTOM - 56, 40, 12, "F4B074"),
      rect(400, 76, 96, 4, "F4C2AC"),
    ],
  },
  night: {
    id: ID.skyNight,
    art: [
      ...bands(["283152", "2E3859", "343F62", "3B476B"]),
      ...[
        [480, 44, 12, 4],
        [472, 48, 12, 4],
        [468, 52, 8, 16],
        [472, 68, 12, 4],
        [480, 72, 12, 4],
      ].map(([x, y, w, h]) => rect(x, y, w, h, "F3E7B5")), // crescent moon
      ...[
        [84, 36],
        [196, 88],
        [300, 28],
        [404, 72],
        [620, 104],
        [28, 120],
      ].map(([x, y]) => rect(x, y, 4, 4, "FDF6D8")), // stars
    ],
  },
};
const sky = Object.entries(SKIES).map(([time, { id, art }]) =>
  node(`Sky ${time}`, id, art, time === "day" ? "" : 'opacity="0"'),
);
/** A see-through colour over the ground (aa = alpha in hex). */
const shadeRect = (color, alpha) =>
  `<Shape x="0" y="${SKY_BOTTOM}"><Rectangle width="${WIDTH}" height="${HEIGHT - SKY_BOTTOM}" originX="0" originY="0"/><Fill><SolidColor colorValue="${alpha}${color}"/></Fill></Shape>`;
const SHADES = {
  dawn: { id: ID.shadeDawn, color: "8E9AC2", alpha: "2E" },
  dusk: { id: ID.shadeDusk, color: "E0875A", alpha: "29" },
  night: { id: ID.shadeNight, color: "1E2747", alpha: "73" },
};
/** A colour seen through a shade: the same mix the ground gets. */
const through = ({ color, alpha }) => {
  const a = parseInt(alpha, 16) / 255;
  return (base) =>
    [0, 2, 4]
      .map((i) => {
        const mix =
          parseInt(base.slice(i, i + 2), 16) * (1 - a) +
          parseInt(color.slice(i, i + 2), 16) * a;
        return Math.round(mix).toString(16).padStart(2, "0");
      })
      .join("")
      .toUpperCase();
};
// Tree tops reach above the shaded ground, so each time has its own trees.
const TREE_IDS = {
  day: ID.treesDay,
  dawn: ID.treesDawn,
  dusk: ID.treesDusk,
  night: ID.treesNight,
};
const treeVariants = Object.entries(TREE_IDS).map(([time, id]) =>
  node(
    `Trees ${time}`,
    id,
    trees.flatMap(([x, y, dark]) =>
      tree(x, y, dark, time === "day" ? undefined : through(SHADES[time])),
    ),
    time === "day" ? "" : 'opacity="0"',
  ),
);
const shades = Object.entries(SHADES).map(([time, { id, color, alpha }]) =>
  node(`Shade ${time}`, id, [shadeRect(color, alpha)], 'opacity="0"'),
);
const outdoors = [
  ...sky,
  node("Clouds", ID.clouds, clouds),
  rect(0, GROUND - 100, WIDTH, 76, "B7C9A2"), // meadow
  rect(0, GROUND - 60, WIDTH, 20, "A8BE92"),
  rect(0, GROUND - 24, WIDTH, 64, "E8D5B5"), // path
  rect(0, GROUND - 24, WIDTH, 4, "D4C29E"),
  rect(0, GROUND + 36, WIDTH, 4, "CFB993"),
  rect(0, GROUND + 40, WIDTH, HEIGHT - GROUND - 40, "B7C9A2"), // verge
  node("Path details", ID.path, path),
  rect(DOG_X + 5 * CELL, GROUND, 34 * CELL, CELL, "CBB38F"), // Kkami's shadow
  ...shades,
  // Above the shade: each time has its own tinted trees. They end above the path.
  node("Passing trees", ID.trees, treeVariants),
];
const art = [node("Outdoors", ID.outdoors, outdoors, `x="${WIDTH}"`), dog];

// --- State machine ----------------------------------------------------------
let nextLayer = ID.layerBase;
let nextState = ID.stateBase;
let nextAnimation = ID.animationBase;
const animations = [];
// Rive reads a transition's exitTime in milliseconds, so each chained state
// leaves after its own animation's length.
const lengthMs = new Map();
/** A linear animation; x moves from `from` to `to` (quantized to whole cells). */
const animation = (name, { fps = FPS, frames, body = [] }) => {
  const id = nextAnimation++;
  lengthMs.set(id, Math.round((frames * 1000) / fps));
  animations.push(
    `<LinearAnimation name="${name}" id="0:${id}" fps="${fps}" duration="${frames}" loopValue="oneShot" quantize="true">${body.join("")}</LinearAnimation>`,
  );
  return id;
};
const slide = (target, frames, from, to) =>
  keys(
    target,
    {
      x: [
        [0, from],
        [frames, to],
      ],
    },
    "linear",
  );
const hold = (target, x) => keys(target, { x: [[0, x]] });

const prepare = animation("Prepare", { frames: 2 });
// Scenery waits out the front pose and turn: it moves only once Kkami walks.
const pause = animation("Pause", { frames: START });
/**
 * A layer that plays its animations in order, each starting when the previous
 * one ends. `fire` maps an animation to a trigger sent as its state begins.
 */
const layer = (name, steps, fire = {}) => {
  const id = nextLayer++;
  const states = steps.map(() => nextState++);
  const body = steps
    .map((animationId, index) => {
      const trigger = fire[animationId]
        ? `<StateMachineFireTrigger viewModelPathIds="0:${ID.model}-0:${fire[animationId]}" occursValue="atStart"/>`
        : "";
      const next =
        index < steps.length - 1
          ? `<StateTransition stateToId="0:${states[index + 1]}" enableExitTime="true" exitTime="${lengthMs.get(animationId)}"/>`
          : "";
      return `<AnimationState x="${180 + index * 220}" y="0" animationId="0:${animationId}" id="0:${states[index]}">${trigger}${next}</AnimationState>`;
    })
    .join("");
  return `<StateMachineLayer name="${name}" id="0:${id}"><AnyState x="0" y="-120"/><ExitState x="0" y="120"/><EntryState x="0" y="0"><StateTransition stateToId="0:${states[0]}"/></EntryState>${body}</StateMachineLayer>`;
};

const STOP = TRIP.toSpot; // the path stops where the find is
const startId = animation("Start", { frames: START, body: start });
const walkOutId = animation("Walk out", { frames: TRIP.toSpot, body: walkOut });
// The sky layer: entry picks the time the page set; day also follows a late
// setting (the page may set it right after the first frame).
const BOOLEAN_VALUE_KEY = 634;
const when = (to, property) =>
  `<StateTransition stateToId="0:${to}" duration="0"><TransitionViewModelCondition><TransitionPropertyViewModelComparator><BindablePropertyBoolean><DataBindContext sourcePathIds="0:${ID.model}-0:${property}" propertyKey="${BOOLEAN_VALUE_KEY}"/></BindablePropertyBoolean></TransitionPropertyViewModelComparator><TransitionValueBooleanComparator value="true"/></TransitionViewModelCondition></StateTransition>`;
const TIMES = ["day", "dawn", "dusk", "night"];
const FLAG = { dawn: ID.isDawn, dusk: ID.isDusk, night: ID.isNight };
const skyLayer = () => {
  const id = nextLayer++;
  const state = Object.fromEntries(TIMES.map((time) => [time, nextState++]));
  const look = (time) =>
    animation(`Sky ${time}`, {
      frames: 1,
      body: [
        ...TIMES.map((t) =>
          keys(SKIES[t].id, { opacity: [[0, t === time ? 1 : 0]] }),
        ),
        ...Object.entries(SHADES).map(([t, { id: shade }]) =>
          keys(shade, { opacity: [[0, t === time ? 1 : 0]] }),
        ),
        ...TIMES.map((t) =>
          keys(TREE_IDS[t], { opacity: [[0, t === time ? 1 : 0]] }),
        ),
        keys(ID.clouds, { opacity: [[0, time === "night" ? 0 : 1]] }),
      ],
    });
  const toOthers = TIMES.filter((t) => t !== "day")
    .map((t) => when(state[t], FLAG[t]))
    .join("");
  const states = TIMES.map(
    (time, index) =>
      `<AnimationState x="${180 + index * 220}" y="0" animationId="0:${look(time)}" id="0:${state[time]}">${time === "day" ? toOthers : ""}</AnimationState>`,
  ).join("");
  return `<StateMachineLayer name="Sky" id="0:${id}"><AnyState x="0" y="-120"/><ExitState x="0" y="120"/><EntryState x="0" y="0">${toOthers}<StateTransition stateToId="0:${state.day}"/></EntryState>${states}</StateMachineLayer>`;
};
const layers = [
  layer(
    "Kkami",
    [
      prepare,
      startId,
      walkOutId,
      animation("Pick up", { frames: TRIP.pick, body: pick }),
      animation("Walk home", { frames: TRIP.toHome, body: walkHome }),
      animation("Arrive", { frames: TRIP.arrive, body: arrive }),
    ],
    { [startId]: ID.ready, [walkOutId]: ID.walkStarted },
  ),
  layer("Outdoors", [
    prepare,
    pause,
    animation("Go outside", {
      frames: SLIDE,
      body: [slide(ID.outdoors, SLIDE, WIDTH, 0)],
    }),
    animation("Outside", {
      frames: TRIP.toSpot + TRIP.pick + TRIP.toHome - SLIDE,
      body: [hold(ID.outdoors, 0)],
    }),
    animation("Go inside", {
      frames: SLIDE,
      body: [slide(ID.outdoors, SLIDE, 0, -WIDTH)],
    }),
  ]),
  layer("Path", [
    prepare,
    pause,
    animation("Path out", {
      frames: TRIP.toSpot,
      body: [slide(ID.path, TRIP.toSpot, 0, -PATH_OUT)],
    }),
    animation("Path stop", {
      frames: TRIP.pick,
      body: [hold(ID.path, -PATH_OUT)],
    }),
    animation("Path home", {
      frames: TRIP.toHome + TRIP.arrive,
      body: [slide(ID.path, TRIP.toHome + TRIP.arrive, -PATH_OUT, -PATH_TRIP)],
    }),
  ]),
  // Trees pass at half the path speed: a cell every other frame.
  layer("Trees", [
    prepare,
    pause,
    animation("Trees out", {
      fps: FPS / 2,
      frames: STOP / 2,
      body: [slide(ID.trees, STOP / 2, 0, (-STOP / 2) * CELL)],
    }),
    animation("Trees stop", {
      fps: FPS / 2,
      frames: TRIP.pick / 2,
      body: [hold(ID.trees, (-STOP / 2) * CELL)],
    }),
    animation("Trees home", {
      fps: FPS / 2,
      frames: (TRIP.toHome + TRIP.arrive) / 2,
      body: [
        slide(
          ID.trees,
          (TRIP.toHome + TRIP.arrive) / 2,
          (-STOP / 2) * CELL,
          -TREES_TRIP,
        ),
      ],
    }),
  ]),
  // Clouds drift on their own, a cell every six frames.
  layer("Clouds", [
    prepare,
    pause,
    animation("Clouds", {
      fps: FPS / 6,
      frames: CLOUD_DRIFT / CELL,
      body: [slide(ID.clouds, CLOUD_DRIFT / CELL, 0, -CLOUD_DRIFT)],
    }),
  ]),
];

// Built last so the other layers keep their identities.
layers.push(skyLayer());

const scene = `<Rive version="1" kind="fragment">
<Artboard width="${WIDTH}" height="${HEIGHT}" name="Walk" id="0:${ID.board}" styleId="0:${ID.style}" defaultStateMachineId="0:${ID.machine}" viewModelId="0:${ID.model}" viewModelInstanceId="0:${ID.instance}">
<LayoutComponentStyle name="Artboard Style" id="0:${ID.style}"/>
${art.toReversed().join("\n")}
<StateMachine name="Walk" id="0:${ID.machine}">
${layers.join("\n")}
</StateMachine>
${animations.join("\n")}
</Artboard>
<ViewModel name="WalkModel" id="0:${ID.model}" defaultInstanceId="0:${ID.instance}"><ViewModelPropertyTrigger name="sceneReady" id="0:${ID.ready}"/><ViewModelPropertyTrigger name="walkStarted" id="0:${ID.walkStarted}"/><ViewModelPropertyBoolean name="isDawn" id="0:${ID.isDawn}"/><ViewModelPropertyBoolean name="isDusk" id="0:${ID.isDusk}"/><ViewModelPropertyBoolean name="isNight" id="0:${ID.isNight}"/><ViewModelInstance name="Default" id="0:${ID.instance}" exports="true"><ViewModelInstanceTrigger viewModelPropertyId="0:${ID.ready}"/><ViewModelInstanceTrigger viewModelPropertyId="0:${ID.walkStarted}"/><ViewModelInstanceBoolean viewModelPropertyId="0:${ID.isDawn}" propertyValue="false"/><ViewModelInstanceBoolean viewModelPropertyId="0:${ID.isDusk}" propertyValue="false"/><ViewModelInstanceBoolean viewModelPropertyId="0:${ID.isNight}" propertyValue="false"/></ViewModelInstance></ViewModel>
</Rive>`;
writeFileSync(
  new URL("../src/assets/kkami-walk/scene.rml", import.meta.url),
  scene,
);
console.log("Generated src/assets/kkami-walk/scene.rml");
