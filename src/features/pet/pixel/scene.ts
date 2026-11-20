// 까미 도트 장면의 뼈대: 사각형과 노드(묶음), 그리고 노드를 움직이는 키프레임.
// 좌표는 장면 단위(unit)이고 도트 한 칸은 CELL(4)단위입니다. 방 그림(roomArt)과 같은 칸 크기로 보입니다.
// 자식은 뒤에서 앞으로(먼저 쓴 것이 아래) 그립니다.

/** One dot is this many scene units. */
export const CELL = 4;

/** A filled rectangle, in its node's units. `color` is #rrggbb or #rrggbbaa. */
export type Rect = {
  kind: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

/** What keyframes can change on a node. Opacity 0 hides it with its children. */
export type Prop = "x" | "y" | "scaleX" | "scaleY" | "opacity";
export type Props = Record<Prop, number>;

/** A group of rectangles and nodes, moved and scaled together. */
export type SceneNode = Props & {
  kind: "node";
  /** Needed only for nodes that clips or the page change. */
  id?: string;
  children: readonly SceneItem[];
};
export type SceneItem = Rect | SceneNode;

export type Scene = {
  width: number;
  height: number;
  /** Back to front. */
  items: readonly SceneItem[];
};

/** `color` as written in the art: six (or eight, with alpha last) hex digits, `#` optional. */
export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
): Rect {
  const hex = color.startsWith("#") ? color.slice(1) : color;
  return { kind: "rect", x, y, width, height, color: `#${hex.toLowerCase()}` };
}

export function node(
  id: string | undefined,
  children: readonly SceneItem[],
  props: Partial<Props> = {},
): SceneNode {
  return {
    kind: "node",
    id,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    ...props,
    children,
  };
}

/** Every node with an id, for checking clips against the scene. */
export function nodeIds(scene: Scene): Set<string> {
  const ids = new Set<string>();
  const visit = (items: readonly SceneItem[]) => {
    for (const item of items) {
      if (item.kind !== "node") continue;
      if (item.id) {
        if (ids.has(item.id)) throw new Error(`Duplicate node id ${item.id}`);
        ids.add(item.id);
      }
      visit(item.children);
    }
  };
  visit(scene.items);
  return ids;
}
