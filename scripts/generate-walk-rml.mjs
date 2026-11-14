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

// A separate scene keeps the walk out of the first home download.
// Stable RML identities. Preserve the numbers when adding or rearranging artwork.
const ID = {
  board: 2,
  style: 5,
  machine: 7,
  gaitLayer: 8,
  pathLayer: 9,
  treeLayer: 10,
  cloudLayer: 11,
  boot: 12,
  walking: 13,
  starting: 14,
  pathBoot: 15,
  pathWait: 16,
  pathLoop: 17,
  treeBoot: 18,
  treeWait: 19,
  treeLoop: 20,
  cloudBoot: 21,
  cloudWait: 22,
  cloudLoop: 23,
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
  outdoorsLayer: 36,
  outdoorsBoot: 37,
  outdoorsWait: 38,
  outdoorsIn: 39,
  model: 40,
  instance: 41,
  ready: 42,
  walkStarted: 43,
  gait: 50,
  pathScroll: 51,
  prepare: 52,
  start: 53,
  treeScroll: 54,
  cloudScroll: 55,
  pause: 56,
  enter: 57,
  legBase: 100, // + leg * 16 + frame
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
/** Hold keys (Rive units) for one poseAt field over the walk cycle. */
const track = (field) =>
  steps(range(FRAMES).map((frame) => poseAt(frame)[field] * CELL));

// --- Kkami -----------------------------------------------------------------
const legNodes = LEGS.map((leg, legIndex) => {
  const poses = range(FRAMES).map((frame) =>
    node(
      `${leg.name} ${frame + 1}`,
      ID.legBase + legIndex * 16 + frame,
      pixels(legCells(leg, pawAt(frame, leg.phase))),
      frame === 0 ? "" : 'opacity="0"',
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

const gait = [
  keys(ID.front, { opacity: [[0, 0]] }),
  keys(ID.turning, { opacity: [[0, 0]] }),
  keys(ID.walker, { opacity: [[0, 1]] }),
  ...LEGS.flatMap((_, legIndex) =>
    range(FRAMES).map((pose) =>
      keys(ID.legBase + legIndex * 16 + pose, {
        opacity: steps(range(FRAMES).map((frame) => (frame === pose ? 1 : 0))),
      }),
    ),
  ),
  keys(ID.body, { y: track("bob") }),
  keys(ID.head, { y: track("bob") }),
  keys(ID.tail, { x: track("wag") }),
  keys(ID.ear, { y: track("ear") }),
];
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

// --- Scenery (4-unit grid; each layer steps a whole cell per frame) ---------
const tree = (x, y, dark = false) => {
  const leaf = dark ? "7F9E77" : "9CB28B";
  return [
    rect(x + 32, y + 64, 12, 56, "98856B"),
    rect(x + 40, y + 72, 4, 48, "7E705D"),
    rect(x + 8, y + 20, 64, 64, leaf),
    rect(x + 20, y + 4, 40, 92, leaf),
    rect(x, y + 36, 80, 32, leaf),
    rect(x + 16, y + 24, 12, 16, dark ? "9DB88D" : "B6C79E"),
    rect(x + 28, y + 12, 24, 8, dark ? "9DB88D" : "B6C79E"),
    rect(x + 56, y + 52, 16, 24, dark ? "6D8F68" : "8CA27E"),
  ];
};
const cloud = (x, y) => [
  rect(x, y + 8, 64, 12, "F7F6E9"),
  rect(x + 12, y, 32, 24, "F7F6E9"),
];
const TILE = 640; // trees and clouds repeat every tile
const PATH_TILE = 160; // path details repeat every 40 frames
const trees = [];
const clouds = [];
for (const offset of [0, TILE, TILE * 2]) {
  trees.push(
    ...tree(offset + 24, GROUND - 164),
    ...tree(offset + 204, GROUND - 176, true),
    ...tree(offset + 472, GROUND - 156),
  );
  clouds.push(...cloud(offset + 80, 60), ...cloud(offset + 392, 40));
}
const path = [];
for (let x = 0; x < WIDTH + PATH_TILE; x += PATH_TILE / 2) {
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
// The outdoors waits off to the right while Kkami stands in the home room (the
// page draws the room behind the transparent canvas), then slides in.
const ENTER_STEPS = 10; // 68 units (17 cells) per frame
const outdoors = [
  rect(0, 0, WIDTH, HEIGHT, "DCE9E4"), // sky
  rect(536, 52, 32, 32, "F7EDC7"), // sun
  node("Clouds", ID.clouds, clouds),
  rect(0, GROUND - 100, WIDTH, 76, "B7C9A2"), // meadow
  rect(0, GROUND - 60, WIDTH, 20, "A8BE92"),
  node("Passing trees", ID.trees, trees),
  rect(0, GROUND - 24, WIDTH, 64, "E8D5B5"), // path
  rect(0, GROUND - 24, WIDTH, 4, "D4C29E"),
  rect(0, GROUND + 36, WIDTH, 4, "CFB993"),
  rect(0, GROUND + 40, WIDTH, HEIGHT - GROUND - 40, "B7C9A2"), // verge
  node("Path details", ID.path, path),
  rect(DOG_X + 5 * CELL, GROUND, 34 * CELL, CELL, "CBB38F"), // Kkami's shadow
];
const art = [node("Outdoors", ID.outdoors, outdoors, `x="${WIDTH}"`), dog];

// Layers that wait out the start, then play one animation from the first step.
const afterStartLayer = (name, layer, boot, wait, play, animation) =>
  `<StateMachineLayer name="${name}" id="0:${layer}"><AnyState x="0" y="-120"/><ExitState x="440" y="-120"/><EntryState x="0" y="0"><StateTransition stateToId="0:${boot}"/></EntryState><AnimationState x="180" y="0" animationId="0:${ID.prepare}" id="0:${boot}"><StateTransition stateToId="0:${wait}" enableExitTime="true" exitTime="100"/></AnimationState><AnimationState x="400" y="0" animationId="0:${ID.pause}" id="0:${wait}"><StateTransition stateToId="0:${play}" enableExitTime="true" exitTime="100"/></AnimationState><AnimationState x="620" y="0" animationId="0:${animation}" id="0:${play}"/></StateMachineLayer>`;
// Linear keys with quantize land on whole cells at every step of the layer's fps.
const slide = (name, id, target, { fps, frames, from, to, loop = false }) =>
  `<LinearAnimation name="${name}" id="0:${id}" fps="${fps}" duration="${frames}" loopValue="${loop ? "loop" : "oneShot"}" quantize="true">${keys(
    target,
    {
      x: [
        [0, from],
        [frames, to],
      ],
    },
    "linear",
  )}</LinearAnimation>`;
/** A looping layer that moves one cell per frame of its fps. */
const scroll = (name, id, target, fps, distance) =>
  slide(name, id, target, {
    fps,
    frames: distance / CELL,
    from: 0,
    to: -distance,
    loop: true,
  });

const scene = `<Rive version="1" kind="fragment">
<Artboard width="${WIDTH}" height="${HEIGHT}" name="Walk" id="0:${ID.board}" styleId="0:${ID.style}" defaultStateMachineId="0:${ID.machine}" viewModelId="0:${ID.model}" viewModelInstanceId="0:${ID.instance}">
<LayoutComponentStyle name="Artboard Style" id="0:${ID.style}"/>
${art.toReversed().join("\n")}
<StateMachine name="Walk" id="0:${ID.machine}">
<StateMachineLayer name="Gait" id="0:${ID.gaitLayer}"><AnyState x="0" y="-120"/><ExitState x="440" y="-120"/><EntryState x="0" y="0"><StateTransition stateToId="0:${ID.boot}"/></EntryState>
<AnimationState x="180" y="0" animationId="0:${ID.prepare}" id="0:${ID.boot}"><StateTransition stateToId="0:${ID.starting}" enableExitTime="true" exitTime="100"/></AnimationState>
<AnimationState x="400" y="0" animationId="0:${ID.start}" id="0:${ID.starting}"><StateMachineFireTrigger viewModelPathIds="0:${ID.model}-0:${ID.ready}" occursValue="atStart"/><StateTransition stateToId="0:${ID.walking}" enableExitTime="true" exitTime="100"/></AnimationState>
<AnimationState x="620" y="0" animationId="0:${ID.gait}" id="0:${ID.walking}"><StateMachineFireTrigger viewModelPathIds="0:${ID.model}-0:${ID.walkStarted}" occursValue="atStart"/></AnimationState>
</StateMachineLayer>
${afterStartLayer("Path", ID.pathLayer, ID.pathBoot, ID.pathWait, ID.pathLoop, ID.pathScroll)}
${afterStartLayer("Trees", ID.treeLayer, ID.treeBoot, ID.treeWait, ID.treeLoop, ID.treeScroll)}
${afterStartLayer("Clouds", ID.cloudLayer, ID.cloudBoot, ID.cloudWait, ID.cloudLoop, ID.cloudScroll)}
${afterStartLayer("Outdoors", ID.outdoorsLayer, ID.outdoorsBoot, ID.outdoorsWait, ID.outdoorsIn, ID.enter)}
</StateMachine>
<LinearAnimation name="Prepare" id="0:${ID.prepare}" fps="${FPS}" duration="2" loopValue="oneShot"/>
<LinearAnimation name="Start" id="0:${ID.start}" fps="${FPS}" duration="${START}" loopValue="oneShot" quantize="true">${start.join("")}</LinearAnimation>
<LinearAnimation name="Pause" id="0:${ID.pause}" fps="${FPS}" duration="${START}" loopValue="oneShot"/>
<LinearAnimation name="Walking" id="0:${ID.gait}" fps="${FPS}" duration="${FRAMES}" loopValue="loop" quantize="true">${gait.join("")}</LinearAnimation>
${slide("Go outside", ID.enter, ID.outdoors, { fps: FPS, frames: ENTER_STEPS, from: WIDTH, to: 0 })}
${scroll("Path", ID.pathScroll, ID.path, FPS, PATH_TILE)}
${scroll("Trees", ID.treeScroll, ID.trees, FPS / 2, TILE)}
${scroll("Clouds", ID.cloudScroll, ID.clouds, FPS / 6, TILE)}
</Artboard>
<ViewModel name="WalkModel" id="0:${ID.model}" defaultInstanceId="0:${ID.instance}"><ViewModelPropertyTrigger name="sceneReady" id="0:${ID.ready}"/><ViewModelPropertyTrigger name="walkStarted" id="0:${ID.walkStarted}"/><ViewModelInstance name="Default" id="0:${ID.instance}" exports="true"><ViewModelInstanceTrigger viewModelPropertyId="0:${ID.ready}"/><ViewModelInstanceTrigger viewModelPropertyId="0:${ID.walkStarted}"/></ViewModelInstance></ViewModel>
</Rive>`;
writeFileSync(
  new URL("../src/assets/kkami-walk/scene.rml", import.meta.url),
  scene,
);
console.log("Generated src/assets/kkami-walk/scene.rml");
