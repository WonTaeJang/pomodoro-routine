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
const transition = (to, value) =>
  `<StateTransition stateToId="0:${to}" duration="0"><TransitionViewModelCondition><TransitionPropertyViewModelComparator><BindablePropertyBoolean><DataBindContext sourcePathIds="0:40-0:42" propertyKey="634"/></BindablePropertyBoolean></TransitionPropertyViewModelComparator><TransitionValueBooleanComparator value="${value}"/></TransitionViewModelCondition></StateTransition>`;
const idle = [
  keys(10, {
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
  keys(10, {
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
${heart(92, 92, 30)}${heart(244, 72, 31)}
${node("Kkami", 10, dog, 'x="180" y="164"')}
${rect(124, 240, 112, 8, "D9C6A8")}${rect(136, 248, 88, 4, "E6D5BA")}
<StateMachine name="Pet" id="0:7"><StateMachineLayer name="Mood" id="0:8">
<AnyState x="0" y="-120"/><ExitState x="440" y="-120"/>
<EntryState x="0" y="0"><StateTransition stateToId="0:12"/></EntryState>
<AnimationState x="180" y="0" animationId="0:50" id="0:12">${transition(13, true)}</AnimationState>
<AnimationState x="400" y="0" animationId="0:51" reset="true" id="0:13">${transition(12, false)}</AnimationState>
</StateMachineLayer></StateMachine>
<LinearAnimation name="Idle" id="0:50" fps="12" duration="36" loopValue="loop" quantize="true">${idle.join("")}</LinearAnimation>
<LinearAnimation name="Happy" id="0:51" fps="12" duration="16" loopValue="loop" quantize="true">${happy.join("")}</LinearAnimation>
</Artboard>
<ViewModel name="PetModel" id="0:40" defaultInstanceId="0:41">
<ViewModelPropertyBoolean name="isHappy" id="0:42"/>
<ViewModelInstance name="Default" id="0:41" exports="true"><ViewModelInstanceBoolean viewModelPropertyId="0:42" propertyValue="false"/></ViewModelInstance>
</ViewModel>
</Rive>`;
writeFileSync(
  new URL("../src/assets/kkami-pet/scene.rml", import.meta.url),
  scene,
);
console.log("Generated src/assets/kkami-pet/scene.rml");
