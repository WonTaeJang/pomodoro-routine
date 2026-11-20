// 집 까미 장면(360×280단위 = 90×70칸): 엎드려 자기 → 놀람 → 대기, 쓰다듬으면 기쁨, 간식 먹기.
// 직접 그린 원본 도트이고, 사각형은 4단위 격자에 놓습니다. 배열은 뒤에서 앞 순서입니다.

import { PET_SNACK_MS } from "../pet";
import { node, rect, type SceneItem, type Scene } from "../pixel/scene";
import { clip, keys, showOnly, type Track } from "../pixel/timeline";
import type { MachineDef, Transition } from "../pixel/machine";
import {
  outfits,
  toRects,
  WORN_LOOKS,
  type Cell,
  type RectSpec,
  type WornLook,
} from "./outfitCells";

const HOME_WIDTH = 360;
const HOME_HEIGHT = 280;

const ink = "292A30",
  fur = "414249",
  light = "575962",
  cream = "FFF6DD",
  pink = "F2929D";

const head: SceneItem[] = [
  rect(-44, -48, 88, 8, ink),
  rect(-52, -40, 104, 76, ink),
  rect(-44, 36, 88, 8, ink),
  rect(-60, -28, 16, 72, ink),
  rect(44, -28, 16, 72, ink),
  rect(-56, 44, 12, 8, ink),
  rect(44, 44, 12, 8, ink),
  rect(-44, -36, 88, 64, fur),
  rect(-36, -44, 72, 8, fur),
  rect(-36, 28, 72, 8, fur),
  rect(-40, -36, 24, 8, light),
  rect(-48, -24, 8, 28, light),
  rect(44, -16, 8, 36, fur),
  rect(-52, 20, 8, 16, fur),
  rect(-32, -40, 8, 8, light),
  rect(-12, -44, 16, 8, fur),
  rect(12, -40, 12, 8, light),
  rect(-24, 8, 48, 20, light),
  rect(-16, 28, 32, 8, light),
  rect(-12, 8, 24, 8, ink),
  rect(-8, 16, 16, 4, ink),
  rect(-8, 8, 8, 4, "797B83"),
  rect(-4, 20, 8, 8, ink),
  node("eyes", [
    rect(-32, -12, 16, 20, ink),
    rect(16, -12, 16, 20, ink),
    rect(-28, -12, 8, 8, cream),
    rect(20, -12, 8, 8, cream),
    rect(-24, 0, 4, 4, "AAA5A1"),
    rect(24, 0, 4, 4, "AAA5A1"),
  ]),
  node(
    "sleepingEyes",
    [
      rect(-32, 0, 16, 4, cream),
      rect(-28, 4, 8, 4, cream),
      rect(16, 0, 16, 4, cream),
      rect(20, 4, 8, 4, cream),
    ],
    { opacity: 0 },
  ),
  node(
    "happyFace",
    [
      rect(-32, -8, 16, 4, cream),
      rect(-28, -12, 8, 4, cream),
      rect(16, -8, 16, 4, cream),
      rect(20, -12, 8, 4, cream),
      rect(-40, 8, 12, 8, pink),
      rect(28, 8, 12, 8, pink),
      rect(-8, 24, 16, 12, pink),
      rect(-4, 36, 8, 4, pink),
    ],
    { opacity: 0 },
  ),
  node(
    "snackFace",
    [
      rect(-32, -8, 16, 4, cream),
      rect(-28, -12, 8, 4, cream),
      rect(16, -8, 16, 4, cream),
      rect(20, -12, 8, 4, cream),
      rect(-40, 8, 12, 8, pink),
      rect(28, 8, 12, 8, pink),
      rect(-12, 20, 24, 16, light),
      node("snackMouth", [rect(-8, 0, 16, 8, ink), rect(-4, 4, 8, 4, pink)], {
        y: 24,
      }),
    ],
    { opacity: 0 },
  ),
];
/** Body rectangles, relative to the dog: the shirt follows them. */
const DOG_BODY: RectSpec[] = [
  [-36, 12, 72, 56, ink],
  [-44, 36, 88, 24, ink],
  [-28, 16, 56, 44, fur],
  [-16, 20, 32, 32, light],
  [-40, 60, 28, 16, ink],
  [12, 60, 28, 16, ink],
  [-36, 60, 20, 8, fur],
  [16, 60, 20, 8, fur],
  [-28, 12, 56, 8, "D98770"],
  [-4, 20, 8, 8, "E5B95B"],
];
// A separate prone silhouette: long body behind the face, chin on front paws.
// Its geometry is drawn directly, rather than squashing the upright dog.
const restingHead: SceneItem[] = [
  rect(-36, -36, 72, 8, ink),
  rect(-44, -28, 88, 52, ink),
  rect(-36, 24, 72, 8, ink),
  rect(-52, -20, 16, 44, ink),
  rect(36, -20, 16, 44, ink),
  rect(-36, -24, 72, 40, fur),
  rect(-28, -32, 56, 8, fur),
  rect(-28, 16, 56, 8, fur),
  rect(-32, -24, 24, 8, light),
  rect(-40, -16, 8, 20, light),
  rect(12, -28, 12, 8, light),
  rect(40, -12, 8, 24, fur),
  node("restingClosedEyes", [
    rect(-28, -4, 16, 4, cream),
    rect(-24, 0, 8, 4, cream),
    rect(12, -4, 16, 4, cream),
    rect(16, 0, 8, 4, cream),
  ]),
  node(
    "restingOpenEyes",
    [
      rect(-28, -12, 16, 20, ink),
      rect(12, -12, 16, 20, ink),
      rect(-24, -12, 8, 12, cream),
      rect(16, -12, 8, 12, cream),
      rect(-20, 4, 4, 4, "AAA5A1"),
      rect(20, 4, 4, 4, "AAA5A1"),
    ],
    { opacity: 0 },
  ),
  rect(-20, 8, 40, 12, light),
  rect(-12, 20, 24, 4, light),
  rect(-8, 8, 16, 8, ink),
  rect(-4, 8, 4, 4, "797B83"),
  rect(-4, 16, 8, 4, ink),
];
const RESTING_BACK: RectSpec[] = [
  // Curled tail and haunch are behind the head and shoulders.
  [64, -12, 24, 12, ink],
  [80, -20, 12, 20, ink],
  [84, -24, 12, 12, fur],
  [-4, -28, 68, 8, ink],
  [-12, -20, 88, 40, ink],
  [0, 20, 68, 8, ink],
  [0, -20, 64, 36, fur],
  [12, -24, 36, 8, light],
  [60, -8, 12, 24, fur],
  [40, 12, 36, 16, ink],
  [48, 16, 24, 8, light],
];
// Two front paws remain visible just below the resting chin.
const RESTING_PAWS: RectSpec[] = [
  [-76, 20, 36, 12, ink],
  [-20, 20, 36, 12, ink],
  [-72, 20, 28, 8, fur],
  [-16, 20, 28, 8, fur],
  [-64, 24, 4, 4, light],
  [-8, 24, 4, 4, light],
];

// Outfits: the hat rides on the head, the rest on the body under the head.
const shapes = (rects: readonly RectSpec[]) => rects.map((r) => rect(...r));
const OUTFITS = outfits({
  standing: DOG_BODY,
  resting: [...RESTING_BACK, ...RESTING_PAWS],
});
type OutfitPose = "upright" | "resting";
/** The node of an outfit in one pose; the page shows the one Kkami wears. */
export const outfitNodeId = (look: WornLook, pose: OutfitPose) =>
  `${look}:${pose}`;
const worn = (pose: OutfitPose, onHead: boolean) =>
  OUTFITS.filter((outfit) => outfit.onHead === onHead).map((outfit) =>
    node(outfitNodeId(outfit.look, pose), shapes(toRects(outfit[pose])), {
      opacity: 0,
    }),
  );

const dog: SceneItem[] = [
  node("tail", [
    rect(36, 28, 28, 12, ink),
    rect(56, 16, 12, 20, ink),
    rect(60, 8, 12, 12, fur),
  ]),
  ...shapes(DOG_BODY),
  ...worn("upright", false),
  node("head", [...head, ...worn("upright", true)], { y: -28 }),
];
const restingDog: SceneItem[] = [
  ...shapes(RESTING_BACK),
  ...worn("resting", false),
  node("restingHead", [...restingHead, ...worn("resting", true)], {
    x: -28,
    y: -8,
  }),
  ...shapes(RESTING_PAWS),
];

const heart = (x: number, y: number, id: string) =>
  node(
    id,
    [
      rect(4, 0, 8, 4, pink),
      rect(16, 0, 8, 4, pink),
      rect(0, 4, 28, 8, pink),
      rect(4, 12, 20, 4, pink),
      rect(8, 16, 12, 4, pink),
      rect(12, 20, 4, 4, pink),
      rect(4, 4, 4, 4, "FFD5D8"),
    ],
    { x, y, opacity: 0 },
  );

// Golden bone biscuit, split into bites so it is eaten rather than just faded.
const biscuitEdge = "A96932",
  biscuitGold = "DBA253",
  biscuitLight = "F8D28A";
const biscuitBite = (side: -1 | 1) =>
  node(
    side < 0 ? "biscuitLeft" : "biscuitRight",
    [
      rect(-8, -12, 12, 24, biscuitEdge),
      rect(-12, -8, 20, 16, biscuitEdge),
      rect(-8, -8, 12, 16, biscuitGold),
      rect(-4, -8, 8, 4, biscuitLight),
      rect(-4, 4, 8, 4, biscuitLight),
    ],
    { x: side * 20 },
  );
const biscuit = node(
  "biscuit",
  [
    node("biscuitMiddle", [
      rect(-16, -8, 32, 16, biscuitEdge),
      rect(-16, -4, 32, 8, biscuitGold),
      rect(-12, -4, 24, 4, biscuitLight),
      rect(-4, 0, 4, 4, biscuitEdge),
    ]),
    biscuitBite(-1),
    biscuitBite(1),
  ],
  { x: 180, y: 184, opacity: 0 },
);
const Z = "A18C72";

export const HOME_SCENE: Scene = {
  width: HOME_WIDTH,
  height: HOME_HEIGHT,
  items: [
    node("dog", dog, { x: 180, y: 164 }),
    node("restingDog", restingDog, { x: 180, y: 208, opacity: 0 }),
    heart(244, 72, "rightHeart"),
    heart(92, 92, "leftHeart"),
    node(
      "wakeExclamation",
      [
        rect(-8, -32, 16, 28, ink),
        rect(-4, -28, 8, 20, "E5B95B"),
        rect(-8, 0, 16, 12, ink),
        rect(-4, 4, 8, 4, "E5B95B"),
      ],
      { x: 152, y: 136, opacity: 0 },
    ),
    node(
      "sleepZ",
      [
        rect(0, 0, 20, 4, Z),
        rect(12, 4, 8, 4, Z),
        rect(8, 8, 8, 4, Z),
        rect(4, 12, 8, 4, Z),
        rect(0, 16, 20, 4, Z),
      ],
      { x: 244, y: 128, opacity: 0 },
    ),
    node(
      "crumbs",
      [rect(-28, 0, 4, 4, biscuitGold), rect(24, 4, 4, 4, biscuitLight)],
      { x: 180, y: 170, opacity: 0 },
    ),
    biscuit,
  ],
};

// --- Clips ------------------------------------------------------------------
const hideSnack: Track[] = [
  ...keys("snackFace", { opacity: [[0, 0]] }),
  ...keys("biscuit", { opacity: [[0, 0]] }),
  ...keys("crumbs", { opacity: [[0, 0]] }),
];
const awakePose: Track[] = [
  ...keys("wakeExclamation", { opacity: [[0, 0]] }),
  ...keys("restingDog", { opacity: [[0, 0]] }),
  ...keys("sleepingEyes", { opacity: [[0, 0]] }),
  ...keys("sleepZ", { opacity: [[0, 0]] }),
];

// Breathing lifts the body half a cell; the Z rises and fades.
const sleeping = clip(
  { fps: 12, frames: 24, loop: true },
  hideSnack,
  keys("restingClosedEyes", { opacity: [[0, 1]] }),
  keys("restingOpenEyes", { opacity: [[0, 0]] }),
  keys("wakeExclamation", { opacity: [[0, 0]] }),
  keys("dog", { opacity: [[0, 0]] }),
  keys("restingDog", {
    opacity: [[0, 1]],
    y: [
      [0, 208],
      [12, 206],
      [24, 208],
    ],
  }),
  keys("restingHead", {
    y: [
      [0, -8],
      [12, -10],
      [24, -8],
    ],
  }),
  keys("head", { y: [[0, -22]] }),
  keys("eyes", { opacity: [[0, 0]], scaleY: [[0, 1]] }),
  keys("happyFace", { opacity: [[0, 0]] }),
  keys("sleepingEyes", { opacity: [[0, 1]] }),
  keys("tail", { y: [[0, 4]] }),
  keys("leftHeart", { opacity: [[0, 0]] }),
  keys("rightHeart", { opacity: [[0, 0]] }),
  keys("sleepZ", {
    opacity: [
      [0, 1],
      [20, 0],
    ],
    y: [
      [0, 128],
      [8, 120],
      [16, 112],
      [24, 128],
    ],
  }),
);
// Hold the prone pose with open eyes; no breathing or Z while startled.
const startled = clip(
  { fps: 12, frames: 5 },
  hideSnack,
  keys("dog", { opacity: [[0, 0]] }),
  keys("restingDog", { opacity: [[0, 1]], y: [[0, 208]] }),
  keys("restingHead", { y: [[0, -8]] }),
  keys("restingClosedEyes", { opacity: [[0, 0]] }),
  keys("restingOpenEyes", { opacity: [[0, 1]] }),
  keys("wakeExclamation", { opacity: [[0, 1]] }),
  keys("leftHeart", { opacity: [[0, 0]] }),
  keys("rightHeart", { opacity: [[0, 0]] }),
  keys("sleepZ", { opacity: [[0, 0]] }),
);
const idle = clip(
  { fps: 12, frames: 36, loop: true },
  hideSnack,
  awakePose,
  keys("dog", {
    opacity: [[0, 1]],
    scaleX: [[0, 1]],
    scaleY: [[0, 1]],
    y: [
      [0, 164],
      [16, 160],
      [32, 164],
    ],
  }),
  keys("head", {
    y: [
      [0, -28],
      [16, -28],
    ],
  }),
  // A blink near the end of each loop.
  keys("eyes", {
    opacity: [[0, 1]],
    scaleY: [
      [0, 1],
      [26, 0.2],
      [28, 1],
    ],
  }),
  keys("happyFace", { opacity: [[0, 0]] }),
  keys("tail", {
    y: [
      [0, 0],
      [16, -4],
      [32, 0],
    ],
  }),
  keys("leftHeart", { opacity: [[0, 0]] }),
  keys("rightHeart", { opacity: [[0, 0]] }),
);
const happy = clip(
  { fps: 12, frames: 16, loop: true },
  hideSnack,
  awakePose,
  keys("dog", {
    opacity: [[0, 1]],
    scaleX: [[0, 1]],
    scaleY: [[0, 1]],
    y: [
      [0, 164],
      [2, 152],
      [4, 148],
      [6, 156],
      [8, 164],
      [10, 152],
      [12, 148],
      [14, 156],
      [16, 164],
    ],
  }),
  keys("head", {
    y: [
      [0, -28],
      [4, -32],
      [8, -28],
      [12, -32],
      [16, -28],
    ],
  }),
  keys("eyes", { opacity: [[0, 0]], scaleY: [[0, 1]] }),
  keys("happyFace", { opacity: [[0, 1]] }),
  keys("tail", {
    y: [
      [0, -8],
      [2, 4],
      [4, -8],
      [6, 4],
      [8, -8],
      [10, 4],
      [12, -8],
      [14, 4],
      [16, -8],
    ],
  }),
  keys("leftHeart", {
    opacity: [
      [0, 1],
      [14, 0],
    ],
    y: [
      [0, 92],
      [4, 84],
      [8, 76],
      [12, 68],
      [16, 92],
    ],
  }),
  keys("rightHeart", {
    opacity: [
      [0, 0],
      [4, 1],
      [16, 0],
    ],
    y: [
      [0, 72],
      [4, 72],
      [8, 64],
      [12, 56],
      [16, 48],
    ],
  }),
);
// Take the biscuit (0.3 s), chew it from both ends with crumbs (0.9 s), then
// a pleased face, a wag and a heart (0.6 s).
const SNACK_FPS = 20;
const SNACK_FRAMES = (PET_SNACK_MS * SNACK_FPS) / 1000;
const snacking = clip(
  { fps: SNACK_FPS, frames: SNACK_FRAMES },
  awakePose,
  keys("dog", {
    opacity: [[0, 1]],
    scaleX: [[0, 1]],
    scaleY: [[0, 1]],
    y: [[0, 164]],
  }),
  keys("head", {
    y: [
      [0, -24],
      [6, -20],
      [10, -24],
      [14, -20],
      [18, -24],
      [22, -20],
      [24, -28],
    ],
  }),
  keys("eyes", { opacity: [[0, 0]], scaleY: [[0, 1]] }),
  keys("snackFace", {
    opacity: [
      [0, 1],
      [24, 0],
    ],
  }),
  keys("snackMouth", {
    scaleY: [
      [0, 1],
      [8, 0.5],
      [10, 1],
      [12, 0.5],
      [14, 1],
      [16, 0.5],
      [18, 1],
      [20, 0.5],
      [22, 1],
    ],
  }),
  keys("happyFace", {
    opacity: [
      [0, 0],
      [24, 1],
    ],
  }),
  keys("biscuit", {
    opacity: [
      [0, 1],
      [24, 0],
    ],
    y: [
      [0, 184],
      [3, 176],
      [6, 168],
      [10, 164],
      [14, 168],
      [18, 164],
      [22, 168],
    ],
  }),
  keys("biscuitLeft", {
    opacity: [
      [0, 1],
      [10, 0],
    ],
  }),
  keys("biscuitRight", {
    opacity: [
      [0, 1],
      [18, 0],
    ],
  }),
  keys("biscuitMiddle", {
    opacity: [
      [0, 1],
      [24, 0],
    ],
  }),
  keys("crumbs", {
    opacity: [
      [0, 0],
      [10, 1],
      [14, 0],
      [18, 1],
      [22, 0],
    ],
    y: [
      [0, 170],
      [10, 170],
      [12, 178],
      [18, 170],
      [20, 178],
    ],
  }),
  keys("tail", {
    y: [
      [0, 0],
      [6, -4],
      [10, 0],
      [14, -4],
      [18, 0],
      [24, -8],
      [27, 4],
      [30, -8],
      [33, 4],
      [36, 0],
    ],
  }),
  keys("leftHeart", {
    opacity: [
      [0, 0],
      [24, 1],
      [35, 0],
    ],
    y: [
      [0, 92],
      [24, 92],
      [28, 84],
      [32, 76],
    ],
  }),
  keys("rightHeart", { opacity: [[0, 0]] }),
);
export const HOME_CLIPS = { sleeping, startled, idle, happy, snacking };

// --- State machine ------------------------------------------------------------
export type HomeInput = "isHappy" | "isSleeping" | "isStartled" | "isSnacking";
export type HomeState =
  "sleeping" | "startled" | "idle" | "happy" | "snacking" | "snackingAgain";

/** Kkami starts asleep; the page then sets how he feels. */
export const HOME_INPUTS: Record<HomeInput, boolean> = {
  isHappy: false,
  isSleeping: true,
  isStartled: false,
  isSnacking: false,
};

type HomeTransition = Transition<HomeState, HomeInput, "snackAgain">;
const toSleep: HomeTransition = { to: "sleeping", when: (i) => i.isSleeping };
// Another treat restarts the snack: two states take turns so it plays anew.
const snack = (again: HomeState): HomeTransition[] => [
  toSleep,
  { to: "idle", when: (i) => !i.isSnacking },
  { to: again, trigger: "snackAgain" },
];

export const HOME_MACHINE: MachineDef<HomeState, HomeInput, "snackAgain"> = {
  initial: "sleeping",
  states: {
    sleeping: {
      clip: sleeping,
      transitions: [
        { to: "startled", when: (i) => i.isStartled },
        { to: "idle", when: (i) => !i.isSleeping },
      ],
    },
    startled: {
      clip: startled,
      transitions: [toSleep, { to: "idle", when: (i) => !i.isStartled }],
    },
    idle: {
      clip: idle,
      transitions: [
        toSleep,
        { to: "snacking", when: (i) => i.isSnacking },
        { to: "happy", when: (i) => i.isHappy },
      ],
    },
    happy: {
      clip: happy,
      transitions: [
        toSleep,
        { to: "snacking", when: (i) => i.isSnacking },
        { to: "idle", when: (i) => !i.isHappy },
      ],
    },
    snacking: { clip: snacking, transitions: snack("snackingAgain") },
    snackingAgain: { clip: snacking, transitions: snack("snacking") },
  },
};

/** Outfit nodes shown for what Kkami wears: none for the starting collar. */
export function outfitPose(look: string) {
  return (["upright", "resting"] as const).flatMap((pose) =>
    showOnly(
      WORN_LOOKS.map((worn) => outfitNodeId(worn, pose)),
      (WORN_LOOKS as readonly string[]).includes(look)
        ? outfitNodeId(look as WornLook, pose)
        : null,
    ),
  );
}

/** Each outfit standing, for its small picture in the item box and the log. */
export const OUTFIT_UPRIGHT = Object.fromEntries(
  OUTFITS.map(({ look, upright }) => [look, upright]),
) as Record<WornLook, Cell[]>;
