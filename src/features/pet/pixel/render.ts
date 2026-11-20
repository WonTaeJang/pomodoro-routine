import {
  CELL,
  type Props,
  type Rect,
  type Scene,
  type SceneItem,
  type SceneNode,
} from "./scene";
import type { Pose } from "./timeline";

// 장면을 그리기: 노드마다 위치·배율을 쌓아 가며 사각형을 칠합니다. 사각형 모서리를
// 기기 픽셀에 맞춰 반올림해, 배율이 정수가 아니어도(1.2배) 칸 사이에 틈이나 번짐이 없습니다.

/** Where a node's own units land: scale, then offset. */
type Place = { sx: number; sy: number; x: number; y: number; alpha: number };
const ORIGIN: Place = { sx: 1, sy: 1, x: 0, y: 0, alpha: 1 };

/** A node's values: what the pose sets, the scene's own otherwise. */
function propsOf(item: SceneNode, pose: Pose): Props {
  const set = item.id ? pose.get(item.id) : undefined;
  if (!set) return item;
  return {
    x: set.x ?? item.x,
    y: set.y ?? item.y,
    scaleX: set.scaleX ?? item.scaleX,
    scaleY: set.scaleY ?? item.scaleY,
    opacity: set.opacity ?? item.opacity,
  };
}

/** Visit every visible rectangle with its place in scene units, back to front. */
function eachRect(
  scene: Scene,
  pose: Pose,
  visit: (rect: Rect, place: Place) => void,
) {
  const walk = (items: readonly SceneItem[], place: Place) => {
    for (const item of items) {
      if (item.kind === "rect") {
        visit(item, place);
        continue;
      }
      const { x, y, scaleX, scaleY, opacity } = propsOf(item, pose);
      if (opacity <= 0) continue;
      walk(item.children, {
        sx: place.sx * scaleX,
        sy: place.sy * scaleY,
        x: place.x + place.sx * x,
        y: place.y + place.sy * y,
        alpha: place.alpha * Math.min(1, opacity),
      });
    }
  };
  walk(scene.items, ORIGIN);
}

/** A rectangle's edges in scene units. */
function edges({ x, y, width, height }: Rect, place: Place) {
  const x0 = place.x + place.sx * x;
  const y0 = place.y + place.sy * y;
  const x1 = x0 + place.sx * width;
  const y1 = y0 + place.sy * height;
  return {
    left: Math.min(x0, x1),
    right: Math.max(x0, x1),
    top: Math.min(y0, y1),
    bottom: Math.max(y0, y1),
  };
}

/**
 * Draw the scene at `scale` canvas pixels per unit. The canvas is cleared
 * first; what is not drawn stays see-through.
 */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  pose: Pose,
  scale: number,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = false;
  let color = "";
  let alpha = 1;
  eachRect(scene, pose, (rect, place) => {
    const { left, right, top, bottom } = edges(rect, place);
    // Snap each edge on its own, so neighbours share an edge exactly.
    const x0 = Math.round(left * scale);
    const y0 = Math.round(top * scale);
    const x1 = Math.round(right * scale);
    const y1 = Math.round(bottom * scale);
    if (x1 <= x0 || y1 <= y0) return;
    if (rect.color !== color) ctx.fillStyle = color = rect.color;
    if (place.alpha !== alpha) ctx.globalAlpha = alpha = place.alpha;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  });
}

/**
 * The scene as dots: the color covering each cell's middle, "x,y" in cells.
 * For tests and comparisons; colors with alpha are kept as they are.
 */
export function rasterize(scene: Scene, pose: Pose = new Map()) {
  const cells = new Map<string, string>();
  const half = CELL / 2;
  eachRect(scene, pose, (rect, place) => {
    const { left, right, top, bottom } = edges(rect, place);
    const i0 = Math.ceil((left - half) / CELL);
    const i1 = Math.ceil((right - half) / CELL);
    const j0 = Math.ceil((top - half) / CELL);
    const j1 = Math.ceil((bottom - half) / CELL);
    for (let j = j0; j < j1; j++)
      for (let i = i0; i < i1; i++) cells.set(`${i},${j}`, rect.color);
  });
  return cells;
}
