import { writeFileSync } from "node:fs";

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
  node("Eyes", 21, [
    rect(-32, -12, 16, 20, ink),
    rect(16, -12, 16, 20, ink),
    rect(-28, -12, 8, 8, cream),
    rect(20, -12, 8, 8, cream),
    rect(-24, 0, 4, 4, "AAA5A1"),
    rect(24, 0, 4, 4, "AAA5A1"),
  ]),
  node(
    "Sleeping eyes",
    24,
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
    22,
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
];
const dog = [
  node("Tail", 23, [
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
  node("Head", 20, head, 'y="-28"'),
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
  node("Resting closed eyes", 62, [
    rect(-28, -4, 16, 4, cream),
    rect(-24, 0, 8, 4, cream),
    rect(12, -4, 16, 4, cream),
    rect(16, 0, 8, 4, cream),
  ]),
  node(
    "Resting open eyes",
    63,
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
  node("Resting head", 61, restingHead, 'x="-28" y="-8"'),
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
const transition = (to, value, property = 42) =>
  `<StateTransition stateToId="0:${to}" duration="0"><TransitionViewModelCondition><TransitionPropertyViewModelComparator><BindablePropertyBoolean><DataBindContext sourcePathIds="0:40-0:${property}" propertyKey="634"/></BindablePropertyBoolean></TransitionPropertyViewModelComparator><TransitionValueBooleanComparator value="${value}"/></TransitionViewModelCondition></StateTransition>`;
const awakePose = [
  keys(64, { opacity: [[0, 0]] }),
  keys(60, { opacity: [[0, 0]] }),
  keys(24, { opacity: [[0, 0]] }),
  keys(32, { opacity: [[0, 0]] }),
];
const sleeping = [
  keys(62, { opacity: [[0, 1]] }),
  keys(63, { opacity: [[0, 0]] }),
  keys(64, { opacity: [[0, 0]] }),
  keys(10, { opacity: [[0, 0]] }),
  keys(60, {
    opacity: [[0, 1]],
    y: [
      [0, 208],
      [12, 206],
      [24, 208],
    ],
  }),
  keys(61, {
    y: [
      [0, -8],
      [12, -10],
      [24, -8],
    ],
  }),
  keys(20, { y: [[0, -22]] }),
  keys(21, { opacity: [[0, 0]], scaleY: [[0, 1]] }),
  keys(22, { opacity: [[0, 0]] }),
  keys(24, { opacity: [[0, 1]] }),
  keys(23, { y: [[0, 4]] }),
  keys(30, { opacity: [[0, 0]] }),
  keys(31, { opacity: [[0, 0]] }),
  keys(32, {
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
  keys(10, { opacity: [[0, 0]] }),
  keys(60, { opacity: [[0, 1]], y: [[0, 208]] }),
  keys(61, { y: [[0, -8]] }),
  keys(62, { opacity: [[0, 0]] }),
  keys(63, { opacity: [[0, 1]] }),
  keys(64, { opacity: [[0, 1]] }),
  keys(30, { opacity: [[0, 0]] }),
  keys(31, { opacity: [[0, 0]] }),
  keys(32, { opacity: [[0, 0]] }),
];
const idle = [
  ...awakePose,
  keys(10, {
    opacity: [[0, 1]],
    scaleX: [[0, 1]],
    scaleY: [[0, 1]],
    y: [
      [0, 164],
      [16, 160],
      [32, 164],
    ],
  }),
  keys(20, {
    y: [
      [0, -28],
      [16, -28],
    ],
  }),
  keys(21, {
    opacity: [[0, 1]],
    scaleY: [
      [0, 1],
      [26, 0.2],
      [28, 1],
    ],
  }),
  keys(22, { opacity: [[0, 0]] }),
  keys(23, {
    y: [
      [0, 0],
      [16, -4],
      [32, 0],
    ],
  }),
  keys(30, { opacity: [[0, 0]] }),
  keys(31, { opacity: [[0, 0]] }),
];
const happy = [
  ...awakePose,
  keys(10, {
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
  keys(20, {
    y: [
      [0, -28],
      [4, -32],
      [8, -28],
      [12, -32],
      [16, -28],
    ],
  }),
  keys(21, { opacity: [[0, 0]], scaleY: [[0, 1]] }),
  keys(22, { opacity: [[0, 1]] }),
  keys(23, {
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
  keys(30, {
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
  keys(31, {
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
const scene = `<Rive version="1" kind="fragment">
<Artboard width="360" height="280" name="Kkami" id="0:2" styleId="0:5" defaultStateMachineId="0:7" viewModelId="0:40" viewModelInstanceId="0:41">
<LayoutComponentStyle name="Artboard Style" id="0:5"/>
${node("Sleep Z", 32, [rect(0, 0, 20, 4, "A18C72"), rect(12, 4, 8, 4, "A18C72"), rect(8, 8, 8, 4, "A18C72"), rect(4, 12, 8, 4, "A18C72"), rect(0, 16, 20, 4, "A18C72")], 'x="244" y="128" opacity="0"')}
${node("Wake exclamation", 64, [rect(-8, -32, 16, 28, ink), rect(-4, -28, 8, 20, "E5B95B"), rect(-8, 0, 16, 12, ink), rect(-4, 4, 8, 4, "E5B95B")], 'x="152" y="136" opacity="0"')}
${heart(92, 92, 30)}${heart(244, 72, 31)}
${node("Resting Kkami", 60, restingDog, 'x="180" y="208" opacity="0"')}
${node("Kkami", 10, dog, 'x="180" y="164"')}
${rect(124, 240, 112, 8, "D9C6A8")}${rect(136, 248, 88, 4, "E6D5BA")}
<StateMachine name="Pet" id="0:7"><StateMachineLayer name="Mood" id="0:8">
<AnyState x="0" y="-120"/><ExitState x="440" y="-120"/>
<EntryState x="0" y="0"><StateTransition stateToId="0:16"/></EntryState>
<AnimationState x="180" y="-220" animationId="0:52" reset="true" id="0:16"><StateTransition stateToId="0:14" enableExitTime="true" exitTime="100"/></AnimationState>
<AnimationState x="180" y="0" animationId="0:52" reset="true" id="0:14"><StateMachineFireTrigger viewModelPathIds="0:40-0:45" occursValue="atStart"/>${transition(17, true, 44)}${transition(12, false, 43)}</AnimationState>
<AnimationState x="400" y="0" animationId="0:53" reset="true" id="0:17">${transition(14, true, 43)}${transition(12, false, 44)}</AnimationState>
<AnimationState x="400" y="220" animationId="0:50" reset="true" id="0:12">${transition(14, true, 43)}${transition(13, true)}</AnimationState>
<AnimationState x="180" y="220" animationId="0:51" reset="true" id="0:13">${transition(14, true, 43)}${transition(12, false)}</AnimationState>
</StateMachineLayer></StateMachine>
<LinearAnimation name="Sleeping" id="0:52" fps="12" duration="24" loopValue="loop" quantize="true">${sleeping.join("")}</LinearAnimation>
<LinearAnimation name="Startled" id="0:53" fps="12" duration="5" loopValue="oneShot" quantize="true">${startled.join("")}</LinearAnimation>
<LinearAnimation name="Idle" id="0:50" fps="12" duration="36" loopValue="loop" quantize="true">${idle.join("")}</LinearAnimation>
<LinearAnimation name="Happy" id="0:51" fps="12" duration="16" loopValue="loop" quantize="true">${happy.join("")}</LinearAnimation>
</Artboard>
<ViewModel name="PetModel" id="0:40" defaultInstanceId="0:41">
<ViewModelPropertyBoolean name="isHappy" id="0:42"/><ViewModelPropertyBoolean name="isSleeping" id="0:43"/><ViewModelPropertyBoolean name="isStartled" id="0:44"/><ViewModelPropertyTrigger name="sceneReady" id="0:45"/>
<ViewModelInstance name="Default" id="0:41" exports="true"><ViewModelInstanceBoolean viewModelPropertyId="0:42" propertyValue="false"/><ViewModelInstanceBoolean viewModelPropertyId="0:43" propertyValue="true"/><ViewModelInstanceBoolean viewModelPropertyId="0:44" propertyValue="false"/><ViewModelInstanceTrigger viewModelPropertyId="0:45"/></ViewModelInstance>
</ViewModel>
</Rive>`;
writeFileSync(
  new URL("../src/assets/kkami-pet/scene.rml", import.meta.url),
  scene,
);
console.log("Generated src/assets/kkami-pet/scene.rml");
