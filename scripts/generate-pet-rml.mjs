import { writeFileSync } from "node:fs";

// Stable RML identities. Preserve the numbers when adding or rearranging artwork.
const ID = {
  artboard: 2,
  artboardStyle: 5,
  stateMachine: 7,
  moodLayer: 8,
  dog: 10,
  idleState: 12,
  happyState: 13,
  sleepingState: 14,
  bootState: 16,
  startledState: 17,
  snackingState: 18,
  snackingRepeatState: 19,
  head: 20,
  eyes: 21,
  happyFace: 22,
  tail: 23,
  sleepingEyes: 24,
  leftHeart: 30,
  rightHeart: 31,
  sleepZ: 32,
  viewModel: 40,
  defaultInstance: 41,
  isHappy: 42,
  isSleeping: 43,
  isStartled: 44,
  sceneReady: 45,
  isSnacking: 46,
  snackAgain: 47,
  idleAnimation: 50,
  happyAnimation: 51,
  sleepingAnimation: 52,
  startledAnimation: 53,
  snackingAnimation: 54,
  restingDog: 60,
  restingHead: 61,
  restingClosedEyes: 62,
  restingOpenEyes: 63,
  wakeExclamation: 64,
  snackFace: 70,
  biscuit: 71,
  biscuitLeft: 72,
  biscuitRight: 73,
  biscuitMiddle: 74,
  crumbs: 75,
  snackMouth: 76,
};
// BindablePropertyBoolean.propertyValue (verified with rive schema).
const BOOLEAN_VALUE_KEY = 634;

// Original Kkami artwork: rectangles on a four-unit grid, no external assets.
// Rive draws its first child on top, so author back-to-front then reverse.
const rect = (x, y, width, height, color) =>
  `<Shape x="${x}" y="${y}"><Rectangle width="${width}" height="${height}" originX="0" originY="0"/><Fill><SolidColor colorValue="FF${color}"/></Fill></Shape>`;
const node = (name, id, shapes, attrs = "") =>
  `<Node name="${name}" id="0:${id}" ${attrs}>${shapes.toReversed().join("\n")}</Node>`;
const ink = "292A30",
  fur = "414249",
  light = "575962",
  cream = "FFF6DD",
  pink = "F2929D";
const head = [
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
  node("Eyes", ID.eyes, [
    rect(-32, -12, 16, 20, ink),
    rect(16, -12, 16, 20, ink),
    rect(-28, -12, 8, 8, cream),
    rect(20, -12, 8, 8, cream),
    rect(-24, 0, 4, 4, "AAA5A1"),
    rect(24, 0, 4, 4, "AAA5A1"),
  ]),
  node(
    "Sleeping eyes",
    ID.sleepingEyes,
    [
      rect(-32, 0, 16, 4, cream),
      rect(-28, 4, 8, 4, cream),
      rect(16, 0, 16, 4, cream),
      rect(20, 4, 8, 4, cream),
    ],
    'opacity="0"',
  ),
  node(
    "Happy face",
    ID.happyFace,
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
    'opacity="0"',
  ),
  node(
    "Snacking face",
    ID.snackFace,
    [
      rect(-32, -8, 16, 4, cream),
      rect(-28, -12, 8, 4, cream),
      rect(16, -8, 16, 4, cream),
      rect(20, -12, 8, 4, cream),
      rect(-40, 8, 12, 8, pink),
      rect(28, 8, 12, 8, pink),
      rect(-12, 20, 24, 16, light),
      node(
        "Chewing mouth",
        ID.snackMouth,
        [rect(-8, 0, 16, 8, ink), rect(-4, 4, 8, 4, pink)],
        'y="24"',
      ),
    ],
    'opacity="0"',
  ),
];
const dog = [
  node("Tail", ID.tail, [
    rect(36, 28, 28, 12, ink),
    rect(56, 16, 12, 20, ink),
    rect(60, 8, 12, 12, fur),
  ]),
  rect(-36, 12, 72, 56, ink),
  rect(-44, 36, 88, 24, ink),
  rect(-28, 16, 56, 44, fur),
  rect(-16, 20, 32, 32, light),
  rect(-40, 60, 28, 16, ink),
  rect(12, 60, 28, 16, ink),
  rect(-36, 60, 20, 8, fur),
  rect(16, 60, 20, 8, fur),
  rect(-28, 12, 56, 8, "D98770"),
  rect(-4, 20, 8, 8, "E5B95B"),
  node("Head", ID.head, head, 'y="-28"'),
];
// A separate prone silhouette: long body behind the face, chin on front paws.
// Its geometry is authored directly, rather than squashing the upright dog.
const restingHead = [
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
  node("Resting closed eyes", ID.restingClosedEyes, [
    rect(-28, -4, 16, 4, cream),
    rect(-24, 0, 8, 4, cream),
    rect(12, -4, 16, 4, cream),
    rect(16, 0, 8, 4, cream),
  ]),
  node(
    "Resting open eyes",
    ID.restingOpenEyes,
    [
      rect(-28, -12, 16, 20, ink),
      rect(12, -12, 16, 20, ink),
      rect(-24, -12, 8, 12, cream),
      rect(16, -12, 8, 12, cream),
      rect(-20, 4, 4, 4, "AAA5A1"),
      rect(20, 4, 4, 4, "AAA5A1"),
    ],
    'opacity="0"',
  ),
  rect(-20, 8, 40, 12, light),
  rect(-12, 20, 24, 4, light),
  rect(-8, 8, 16, 8, ink),
  rect(-4, 8, 4, 4, "797B83"),
  rect(-4, 16, 8, 4, ink),
];
const restingDog = [
  // Curled tail and haunch are behind the head and shoulders.
  rect(64, -12, 24, 12, ink),
  rect(80, -20, 12, 20, ink),
  rect(84, -24, 12, 12, fur),
  rect(-4, -28, 68, 8, ink),
  rect(-12, -20, 88, 40, ink),
  rect(0, 20, 68, 8, ink),
  rect(0, -20, 64, 36, fur),
  rect(12, -24, 36, 8, light),
  rect(60, -8, 12, 24, fur),
  rect(40, 12, 36, 16, ink),
  rect(48, 16, 24, 8, light),
  node("Resting head", ID.restingHead, restingHead, 'x="-28" y="-8"'),
  // Two front paws remain visible just below the resting chin.
  rect(-76, 20, 36, 12, ink),
  rect(-20, 20, 36, 12, ink),
  rect(-72, 20, 28, 8, fur),
  rect(-16, 20, 28, 8, fur),
  rect(-64, 24, 4, 4, light),
  rect(-8, 24, 4, 4, light),
];
const heart = (x, y, id) =>
  node(
    "Heart",
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
    `x="${x}" y="${y}" opacity="0"`,
  );
const keys = (id, properties) =>
  `<KeyedObject objectId="0:${id}">${Object.entries(properties)
    .map(
      ([property, frames]) =>
        `<KeyedProperty property="${property}">${frames.map(([frame, value]) => `<KeyFrameDouble frame="${frame}" value="${value}" interpolationType="hold"/>`).join("")}</KeyedProperty>`,
    )
    .join("")}</KeyedObject>`;
const transition = (to, value, property = ID.isHappy) =>
  `<StateTransition stateToId="0:${to}" duration="0"><TransitionViewModelCondition><TransitionPropertyViewModelComparator><BindablePropertyBoolean><DataBindContext sourcePathIds="0:${ID.viewModel}-0:${property}" propertyKey="${BOOLEAN_VALUE_KEY}"/></BindablePropertyBoolean></TransitionPropertyViewModelComparator><TransitionValueBooleanComparator value="${value}"/></TransitionViewModelCondition></StateTransition>`;
// Trigger binding uses the integer value key (rive schema BindablePropertyTrigger).
const repeatSnack = (to) =>
  `<StateTransition stateToId="0:${to}" duration="0"><TransitionViewModelCondition><TransitionPropertyViewModelComparator><BindablePropertyTrigger><DataBindContext sourcePathIds="0:${ID.viewModel}-0:${ID.snackAgain}" propertyKey="686"/></BindablePropertyTrigger></TransitionPropertyViewModelComparator><TransitionValueTriggerComparator/></TransitionViewModelCondition></StateTransition>`;
const hideSnack = [
  keys(ID.snackFace, { opacity: [[0, 0]] }),
  keys(ID.biscuit, { opacity: [[0, 0]] }),
  keys(ID.crumbs, { opacity: [[0, 0]] }),
];
const awakePose = [
  keys(ID.wakeExclamation, { opacity: [[0, 0]] }),
  keys(ID.restingDog, { opacity: [[0, 0]] }),
  keys(ID.sleepingEyes, { opacity: [[0, 0]] }),
  keys(ID.sleepZ, { opacity: [[0, 0]] }),
];
const sleeping = [
  ...hideSnack,
  keys(ID.restingClosedEyes, { opacity: [[0, 1]] }),
  keys(ID.restingOpenEyes, { opacity: [[0, 0]] }),
  keys(ID.wakeExclamation, { opacity: [[0, 0]] }),
  keys(ID.dog, { opacity: [[0, 0]] }),
  keys(ID.restingDog, {
    opacity: [[0, 1]],
    y: [
      [0, 208],
      [12, 206],
      [24, 208],
    ],
  }),
  keys(ID.restingHead, {
    y: [
      [0, -8],
      [12, -10],
      [24, -8],
    ],
  }),
  keys(ID.head, { y: [[0, -22]] }),
  keys(ID.eyes, { opacity: [[0, 0]], scaleY: [[0, 1]] }),
  keys(ID.happyFace, { opacity: [[0, 0]] }),
  keys(ID.sleepingEyes, { opacity: [[0, 1]] }),
  keys(ID.tail, { y: [[0, 4]] }),
  keys(ID.leftHeart, { opacity: [[0, 0]] }),
  keys(ID.rightHeart, { opacity: [[0, 0]] }),
  keys(ID.sleepZ, {
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
];
// Hold the prone pose with open eyes; no breathing or Z while startled.
const startled = [
  ...hideSnack,
  keys(ID.dog, { opacity: [[0, 0]] }),
  keys(ID.restingDog, { opacity: [[0, 1]], y: [[0, 208]] }),
  keys(ID.restingHead, { y: [[0, -8]] }),
  keys(ID.restingClosedEyes, { opacity: [[0, 0]] }),
  keys(ID.restingOpenEyes, { opacity: [[0, 1]] }),
  keys(ID.wakeExclamation, { opacity: [[0, 1]] }),
  keys(ID.leftHeart, { opacity: [[0, 0]] }),
  keys(ID.rightHeart, { opacity: [[0, 0]] }),
  keys(ID.sleepZ, { opacity: [[0, 0]] }),
];
const idle = [
  ...hideSnack,
  ...awakePose,
  keys(ID.dog, {
    opacity: [[0, 1]],
    scaleX: [[0, 1]],
    scaleY: [[0, 1]],
    y: [
      [0, 164],
      [16, 160],
      [32, 164],
    ],
  }),
  keys(ID.head, {
    y: [
      [0, -28],
      [16, -28],
    ],
  }),
  keys(ID.eyes, {
    opacity: [[0, 1]],
    scaleY: [
      [0, 1],
      [26, 0.2],
      [28, 1],
    ],
  }),
  keys(ID.happyFace, { opacity: [[0, 0]] }),
  keys(ID.tail, {
    y: [
      [0, 0],
      [16, -4],
      [32, 0],
    ],
  }),
  keys(ID.leftHeart, { opacity: [[0, 0]] }),
  keys(ID.rightHeart, { opacity: [[0, 0]] }),
];
const happy = [
  ...hideSnack,
  ...awakePose,
  keys(ID.dog, {
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
  keys(ID.head, {
    y: [
      [0, -28],
      [4, -32],
      [8, -28],
      [12, -32],
      [16, -28],
    ],
  }),
  keys(ID.eyes, { opacity: [[0, 0]], scaleY: [[0, 1]] }),
  keys(ID.happyFace, { opacity: [[0, 1]] }),
  keys(ID.tail, {
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
  keys(ID.leftHeart, {
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
  keys(ID.rightHeart, {
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
];
// Golden bone biscuit, split into bites so it is eaten rather than just faded.
const biscuitEdge = "A96932",
  biscuitGold = "DBA253",
  biscuitLight = "F8D28A";
const biscuit = node(
  "Bone biscuit",
  ID.biscuit,
  [
    node("Biscuit middle", ID.biscuitMiddle, [
      rect(-16, -8, 32, 16, biscuitEdge),
      rect(-16, -4, 32, 8, biscuitGold),
      rect(-12, -4, 24, 4, biscuitLight),
      rect(-4, 0, 4, 4, biscuitEdge),
    ]),
    ...[
      [-1, ID.biscuitLeft],
      [1, ID.biscuitRight],
    ].map(([side, id]) =>
      node(
        side < 0 ? "Left biscuit bite" : "Right biscuit bite",
        id,
        [
          rect(-8, -12, 12, 24, biscuitEdge),
          rect(-12, -8, 20, 16, biscuitEdge),
          rect(-8, -8, 12, 16, biscuitGold),
          rect(-4, -8, 8, 4, biscuitLight),
          rect(-4, 4, 8, 4, biscuitLight),
        ],
        `x="${side * 20}"`,
      ),
    ),
  ],
  'x="180" y="184" opacity="0"',
);
const snacking = [
  ...awakePose,
  keys(ID.dog, {
    opacity: [[0, 1]],
    scaleX: [[0, 1]],
    scaleY: [[0, 1]],
    y: [[0, 164]],
  }),
  keys(ID.head, {
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
  keys(ID.eyes, { opacity: [[0, 0]], scaleY: [[0, 1]] }),
  keys(ID.snackFace, {
    opacity: [
      [0, 1],
      [24, 0],
    ],
  }),
  keys(ID.snackMouth, {
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
  keys(ID.happyFace, {
    opacity: [
      [0, 0],
      [24, 1],
    ],
  }),
  keys(ID.biscuit, {
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
  keys(ID.biscuitLeft, {
    opacity: [
      [0, 1],
      [10, 0],
    ],
  }),
  keys(ID.biscuitRight, {
    opacity: [
      [0, 1],
      [18, 0],
    ],
  }),
  keys(ID.biscuitMiddle, {
    opacity: [
      [0, 1],
      [24, 0],
    ],
  }),
  keys(ID.crumbs, {
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
  keys(ID.tail, {
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
  keys(ID.leftHeart, {
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
  keys(ID.rightHeart, { opacity: [[0, 0]] }),
];
const scene = `<Rive version="1" kind="fragment">
<Artboard width="360" height="280" name="Kkami" id="0:${ID.artboard}" styleId="0:${ID.artboardStyle}" defaultStateMachineId="0:${ID.stateMachine}" viewModelId="0:${ID.viewModel}" viewModelInstanceId="0:${ID.defaultInstance}">
<LayoutComponentStyle name="Artboard Style" id="0:${ID.artboardStyle}"/>
${biscuit}
${node("Biscuit crumbs", ID.crumbs, [rect(-28, 0, 4, 4, biscuitGold), rect(24, 4, 4, 4, biscuitLight)], 'x="180" y="170" opacity="0"')}
${node("Sleep Z", ID.sleepZ, [rect(0, 0, 20, 4, "A18C72"), rect(12, 4, 8, 4, "A18C72"), rect(8, 8, 8, 4, "A18C72"), rect(4, 12, 8, 4, "A18C72"), rect(0, 16, 20, 4, "A18C72")], 'x="244" y="128" opacity="0"')}
${node("Wake exclamation", ID.wakeExclamation, [rect(-8, -32, 16, 28, ink), rect(-4, -28, 8, 20, "E5B95B"), rect(-8, 0, 16, 12, ink), rect(-4, 4, 8, 4, "E5B95B")], 'x="152" y="136" opacity="0"')}
${heart(92, 92, ID.leftHeart)}${heart(244, 72, ID.rightHeart)}
${node("Resting Kkami", ID.restingDog, restingDog, 'x="180" y="208" opacity="0"')}
${node("Kkami", ID.dog, dog, 'x="180" y="164"')}
${rect(124, 240, 112, 8, "D9C6A8")}${rect(136, 248, 88, 4, "E6D5BA")}
<StateMachine name="Pet" id="0:${ID.stateMachine}"><StateMachineLayer name="Mood" id="0:${ID.moodLayer}">
<AnyState x="0" y="-120"/><ExitState x="440" y="-120"/>
<EntryState x="0" y="0"><StateTransition stateToId="0:${ID.bootState}"/></EntryState>
<AnimationState x="180" y="-220" animationId="0:${ID.sleepingAnimation}" reset="true" id="0:${ID.bootState}"><StateTransition stateToId="0:${ID.sleepingState}" enableExitTime="true" exitTime="100"/></AnimationState>
<AnimationState x="180" y="0" animationId="0:${ID.sleepingAnimation}" reset="true" id="0:${ID.sleepingState}"><StateMachineFireTrigger viewModelPathIds="0:${ID.viewModel}-0:${ID.sceneReady}" occursValue="atStart"/>${transition(ID.startledState, true, ID.isStartled)}${transition(ID.idleState, false, ID.isSleeping)}</AnimationState>
<AnimationState x="400" y="0" animationId="0:${ID.startledAnimation}" reset="true" id="0:${ID.startledState}">${transition(ID.sleepingState, true, ID.isSleeping)}${transition(ID.idleState, false, ID.isStartled)}</AnimationState>
<AnimationState x="400" y="220" animationId="0:${ID.idleAnimation}" reset="true" id="0:${ID.idleState}">${transition(ID.sleepingState, true, ID.isSleeping)}${transition(ID.snackingState, true, ID.isSnacking)}${transition(ID.happyState, true)}</AnimationState>
<AnimationState x="180" y="220" animationId="0:${ID.happyAnimation}" reset="true" id="0:${ID.happyState}">${transition(ID.sleepingState, true, ID.isSleeping)}${transition(ID.snackingState, true, ID.isSnacking)}${transition(ID.idleState, false)}</AnimationState>
<AnimationState x="620" y="220" animationId="0:${ID.snackingAnimation}" reset="true" id="0:${ID.snackingState}">${transition(ID.sleepingState, true, ID.isSleeping)}${transition(ID.idleState, false, ID.isSnacking)}${repeatSnack(ID.snackingRepeatState)}</AnimationState>
<AnimationState x="620" y="440" animationId="0:${ID.snackingAnimation}" reset="true" id="0:${ID.snackingRepeatState}">${transition(ID.sleepingState, true, ID.isSleeping)}${transition(ID.idleState, false, ID.isSnacking)}${repeatSnack(ID.snackingState)}</AnimationState>
</StateMachineLayer></StateMachine>
<LinearAnimation name="Sleeping" id="0:${ID.sleepingAnimation}" fps="12" duration="24" loopValue="loop" quantize="true">${sleeping.join("")}</LinearAnimation>
<LinearAnimation name="Startled" id="0:${ID.startledAnimation}" fps="12" duration="5" loopValue="oneShot" quantize="true">${startled.join("")}</LinearAnimation>
<LinearAnimation name="Idle" id="0:${ID.idleAnimation}" fps="12" duration="36" loopValue="loop" quantize="true">${idle.join("")}</LinearAnimation>
<LinearAnimation name="Happy" id="0:${ID.happyAnimation}" fps="12" duration="16" loopValue="loop" quantize="true">${happy.join("")}</LinearAnimation>
<LinearAnimation name="Snacking" id="0:${ID.snackingAnimation}" fps="20" duration="36" loopValue="oneShot" quantize="true">${snacking.join("")}</LinearAnimation>
</Artboard>
<ViewModel name="PetModel" id="0:${ID.viewModel}" defaultInstanceId="0:${ID.defaultInstance}">
<ViewModelPropertyBoolean name="isHappy" id="0:${ID.isHappy}"/><ViewModelPropertyBoolean name="isSleeping" id="0:${ID.isSleeping}"/><ViewModelPropertyBoolean name="isStartled" id="0:${ID.isStartled}"/><ViewModelPropertyTrigger name="sceneReady" id="0:${ID.sceneReady}"/>
<ViewModelPropertyBoolean name="isSnacking" id="0:${ID.isSnacking}"/><ViewModelPropertyTrigger name="snackAgain" id="0:${ID.snackAgain}"/>
<ViewModelInstance name="Default" id="0:${ID.defaultInstance}" exports="true"><ViewModelInstanceBoolean viewModelPropertyId="0:${ID.isHappy}" propertyValue="false"/><ViewModelInstanceBoolean viewModelPropertyId="0:${ID.isSleeping}" propertyValue="true"/><ViewModelInstanceBoolean viewModelPropertyId="0:${ID.isStartled}" propertyValue="false"/><ViewModelInstanceTrigger viewModelPropertyId="0:${ID.sceneReady}"/><ViewModelInstanceBoolean viewModelPropertyId="0:${ID.isSnacking}" propertyValue="false"/><ViewModelInstanceTrigger viewModelPropertyId="0:${ID.snackAgain}"/></ViewModelInstance>
</ViewModel>
</Rive>`;
writeFileSync(
  new URL("../src/assets/kkami-pet/scene.rml", import.meta.url),
  scene,
);
console.log("Generated src/assets/kkami-pet/scene.rml");
