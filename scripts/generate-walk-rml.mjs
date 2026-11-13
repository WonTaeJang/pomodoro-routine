import { writeFileSync } from "node:fs";
import { traceWalkPoses } from "./trace-walk-poses.mjs";
import {
  WALK_FPS,
  WALK_SECONDS,
  PATH_SPEED,
  LEG_ROOT,
  footAt,
  buildWalkRig,
  deformBand,
} from "./walk-cycle.mjs";

// A separate scene keeps the walk out of the first home download.
// Pixel poses use axis-aligned rectangles; arrays are authored back to front.
const ID = {
  board: 2,
  style: 5,
  machine: 7,
  gaitLayer: 8,
  sceneryLayer: 9,
  boot: 12,
  walking: 13,
  scenery: 14,
  sceneryBoot: 15,
  dog: 20,
  body: 25,
  legBase: 200,
  bandBase: 300,
  trees: 30,
  verge: 31,
  clouds: 32,
  model: 40,
  instance: 41,
  ready: 42,
  gait: 50,
  landscape: 51,
  prepare: 52,
};
const rect = (x, y, w, h, fill) =>
  `<Shape x="${x}" y="${y}"><Rectangle width="${w}" height="${h}" originX="0" originY="0"/><Fill><SolidColor colorValue="FF${fill}"/></Fill></Shape>`;
const node = (name, id, shapes, attrs = "") =>
  `<Node name="${name}" id="0:${id}" ${attrs}>${shapes.toReversed().join("\n")}</Node>`;
const keys = (id, properties, interpolation = "hold") =>
  `<KeyedObject objectId="0:${id}">${Object.entries(properties)
    .map(
      ([property, frames]) =>
        `<KeyedProperty property="${property}">${frames.map(([frame, value]) => `<KeyFrameDouble frame="${frame}" value="${value}" interpolationType="${interpolation}"/>`).join("")}</KeyedProperty>`,
    )
    .join("")}</KeyedObject>`;
const tree = (x, y, dark = false) => [
  rect(x + 32, y + 64, 12, 56, "98856B"),
  rect(x + 40, y + 72, 4, 48, "7E705D"),
  rect(x + 8, y + 20, 64, 64, dark ? "7F9E77" : "9CB28B"),
  rect(x + 20, y + 4, 40, 92, dark ? "7F9E77" : "9CB28B"),
  rect(x, y + 36, 80, 32, dark ? "7F9E77" : "9CB28B"),
  rect(x + 16, y + 24, 12, 16, dark ? "9DB88D" : "B6C79E"),
  rect(x + 28, y + 12, 24, 8, dark ? "9DB88D" : "B6C79E"),
  rect(x + 56, y + 52, 16, 24, dark ? "6D8F68" : "8CA27E"),
];
const cloud = (x, y) => [
  rect(x, y + 8, 64, 12, "F7F6E9"),
  rect(x + 12, y, 32, 24, "F7F6E9"),
];
const trees = [],
  verge = [],
  clouds = [];
for (const offset of [-640, 0, 640, 1280, 1920, 2560]) {
  trees.push(
    ...tree(offset + 24, 88),
    ...tree(offset + 204, 76, true),
    ...tree(offset + 472, 96),
  );
  clouds.push(...cloud(offset + 80, 48), ...cloud(offset + 392, 28));
  for (let x = 0; x < 640; x += 80) {
    verge.push(
      rect(offset + x + 12, 316, 4, 12, "7E9C6D"),
      rect(offset + x + 8, 320, 12, 4, "7E9C6D"),
    );
    verge.push(rect(offset + x + 36, 284, 16, 4, "D6BD97"));
    if (x % 160 === 0)
      verge.push(
        rect(offset + x + 48, 336, 4, 8, "829B70"),
        rect(offset + x + 44, 332, 12, 8, "F4E7BB"),
        rect(offset + x + 48, 332, 4, 4, "DDBA70"),
      );
  }
}
// Keep one approved head/body; animate only the traced leg pixels.
const tracedPoses = await traceWalkPoses();
function tracedArtwork(rectangles, verticalBleed = 0.25) {
  const colors = new Map();
  for (const rectangle of rectangles) {
    const group = colors.get(rectangle.color) ?? [];
    group.push(rectangle);
    colors.set(rectangle.color, group);
  }
  // Compound paths eliminate AA seams between adjacent rectangles of one color.
  // A small overlap also closes seams between different fills at fractional scale.
  return [...colors.entries()].map(
    ([color, group]) =>
      `<Shape>${group
        .map(
          ({ x, y, width, height }) =>
            `<Rectangle x="${x - 0.25}" y="${y - verticalBleed}" width="${width + 0.5}" height="${height + verticalBleed * 2}" originX="0" originY="0"/>`,
        )
        .join(
          "",
        )}<Fill fillRule="nonZero"><SolidColor colorValue="FF${color}"/></Fill></Shape>`,
  );
}
const rig = buildWalkRig(tracedPoses[0]);
const frames = WALK_FPS * WALK_SECONDS;
const gait = [];
const dog = rig.legs.map((leg, legIndex) => {
  const rows = new Map();
  for (const band of leg.bands) {
    const index = Math.round((band.y - LEG_ROOT) / 2.56);
    const row = rows.get(index) ?? [];
    row.push(band);
    rows.set(index, row);
  }
  const scales = Array.from({ length: frames + 1 }, (_, frame) => [
    frame,
    1 + footAt(frame / WALK_FPS, leg.phase).y / -LEG_ROOT,
  ]);
  gait.push(keys(ID.legBase + legIndex, { scaleY: scales }));
  const bands = [...rows.entries()].map(([index, rectangles]) => {
    const y = LEG_ROOT + index * 2.56;
    const id = ID.bandBase + legIndex * 32 + index;
    const positions = Array.from({ length: frames + 1 }, (_, frame) => [
      frame,
      deformBand(rectangles[0], leg, frame / WALK_FPS).x - rectangles[0].x,
    ]);
    gait.push(keys(id, { x: positions }));
    return node(
      `${leg.name} pixel band ${index}`,
      id,
      tracedArtwork(
        rectangles.map((rect) => ({ ...rect, y: rect.y - y })),
        0.8,
      ),
      `x="${positions[0][1]}" y="${y - LEG_ROOT}"`,
    );
  });
  return node(
    leg.name,
    ID.legBase + legIndex,
    bands,
    `y="${LEG_ROOT}" scaleY="${scales[0][1]}"`,
  );
});
dog.push(
  node("Shared approved head and body", ID.body, tracedArtwork(rig.body)),
);
const art = [
  rect(0, 0, 640, 356, "DCE9E4"),
  rect(516, 40, 32, 32, "F7EDC7"),
  node("Clouds", ID.clouds, clouds),
  rect(0, 168, 640, 188, "B7C9A2"),
  rect(0, 208, 640, 20, "A8BE92"),
  node("Passing trees", ID.trees, trees),
  rect(0, 228, 640, 80, "E8D5B5"),
  rect(0, 228, 640, 4, "D4C29E"),
  rect(0, 304, 640, 4, "CFB993"),
  node("Path and flowers", ID.verge, verge),
  rect(244, 260, 160, 8, "CBB38F"),
  rect(260, 268, 128, 4, "D6BD97"),
  node("Walking Kkami", ID.dog, dog, 'x="312" y="264"'),
];
const scene = `<Rive version="1" kind="fragment">
<Artboard width="640" height="356" name="Walk" id="0:${ID.board}" styleId="0:${ID.style}" defaultStateMachineId="0:${ID.machine}" viewModelId="0:${ID.model}" viewModelInstanceId="0:${ID.instance}">
<LayoutComponentStyle name="Artboard Style" id="0:${ID.style}"/>
${art.toReversed().join("\n")}
<StateMachine name="Walk" id="0:${ID.machine}">
<StateMachineLayer name="Gait" id="0:${ID.gaitLayer}"><AnyState x="0" y="-120"/><ExitState x="440" y="-120"/><EntryState x="0" y="0"><StateTransition stateToId="0:${ID.boot}"/></EntryState>
<AnimationState x="180" y="0" animationId="0:${ID.prepare}" id="0:${ID.boot}"><StateTransition stateToId="0:${ID.walking}" enableExitTime="true" exitTime="100"/></AnimationState>
<AnimationState x="400" y="0" animationId="0:${ID.gait}" id="0:${ID.walking}"><StateMachineFireTrigger viewModelPathIds="0:${ID.model}-0:${ID.ready}" occursValue="atStart"/></AnimationState>
</StateMachineLayer>
<StateMachineLayer name="Scenery" id="0:${ID.sceneryLayer}"><AnyState x="0" y="-120"/><ExitState x="440" y="-120"/><EntryState x="0" y="0"><StateTransition stateToId="0:${ID.sceneryBoot}"/></EntryState><AnimationState x="180" y="0" animationId="0:${ID.prepare}" id="0:${ID.sceneryBoot}"><StateTransition stateToId="0:${ID.scenery}" enableExitTime="true" exitTime="100"/></AnimationState><AnimationState x="400" y="0" animationId="0:${ID.landscape}" id="0:${ID.scenery}"/></StateMachineLayer>
</StateMachine>
<LinearAnimation name="Prepare" id="0:${ID.prepare}" fps="12" duration="2" loopValue="oneShot"/>
<LinearAnimation name="Walking" id="0:${ID.gait}" fps="${WALK_FPS}" duration="${frames}" loopValue="loop" quantize="true">${gait.join("")}</LinearAnimation>
<LinearAnimation name="Landscape" id="0:${ID.landscape}" fps="${WALK_FPS}" duration="${WALK_FPS * 40}" loopValue="loop" quantize="true">${keys(
  ID.trees,
  {
    x: [
      [0, 0],
      [WALK_FPS * 40, -640],
    ],
  },
  "linear",
)}${keys(
  ID.verge,
  {
    x: [
      [0, 0],
      [WALK_FPS * 20, -PATH_SPEED * 20],
      [WALK_FPS * 40, -PATH_SPEED * 40],
    ],
  },
  "linear",
)}${keys(
  ID.clouds,
  {
    x: [
      [0, 0],
      [WALK_FPS * 40, -640],
    ],
  },
  "linear",
)}</LinearAnimation>
</Artboard>
<ViewModel name="WalkModel" id="0:${ID.model}" defaultInstanceId="0:${ID.instance}"><ViewModelPropertyTrigger name="sceneReady" id="0:${ID.ready}"/><ViewModelInstance name="Default" id="0:${ID.instance}" exports="true"><ViewModelInstanceTrigger viewModelPropertyId="0:${ID.ready}"/></ViewModelInstance></ViewModel>
</Rive>`;
writeFileSync(
  new URL("../src/assets/kkami-walk/scene.rml", import.meta.url),
  scene,
);
console.log("Generated src/assets/kkami-walk/scene.rml");
