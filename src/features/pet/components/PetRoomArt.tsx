"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  DEFAULT_LOOK,
  editionOf,
  lookOf,
  type LookId,
  type Slot,
} from "../furniture";
import { useShownPlaced } from "../usePetVip";
import {
  ROOMS,
  floorRugArt,
  isRoomLook,
  isRugLook,
  lookArt,
  patternUrl,
  type Pattern,
  type PixelArt,
  type Surface,
} from "../roomArt";
import { useTimeOfDay } from "../useTimeOfDay";
import styles from "./PetPlayground.module.scss";
import { ChristmasSky, WindowLights } from "./PetSleigh";

/** A room drawing at the room's cell size, or at `cell` pixels per cell. */
export function Pixels({ art, cell }: { art: PixelArt; cell?: number }) {
  const unit = cell ? `${cell}px` : "var(--room-cell)";
  return (
    <svg
      className={styles.pixels}
      style={{
        width: `calc(${unit} * ${art.width})`,
        height: `calc(${unit} * ${art.height})`,
      }}
      viewBox={`0 0 ${art.width} ${art.height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {art.paths.map(([color, d]) => (
        <path key={color} d={d} fill={color} />
      ))}
    </svg>
  );
}

/**
 * A furniture look as a small picture: `cell` pixels per cell, or scaled to
 * `height` pixels (log icons).
 */
export function LookPicture({
  look,
  cell,
  height,
  fit = Infinity,
}: {
  look: LookId;
  /** Widest or tallest it may be, in pixels: wide pictures (the cone) and
   * tall ones (the Christmas tree) shrink to fit. */
  fit?: number;
} & ({ cell: number; height?: never } | { height: number; cell?: never })) {
  const art = lookArt(look, "day");
  const size = cell ?? height! / art.height;
  const longest = Math.max(art.width, art.height);
  return <Pixels art={art} cell={Math.min(size, fit / longest)} />;
}

export type RoomDecorating = {
  selected: Slot;
  /** Shown under the selected slot, e.g. the look being tried. */
  tag: string;
  /** Accessible name of each slot's button. */
  label: (slot: Slot) => string;
  onSelect: (slot: Slot) => void;
};

/** Repeat a surface's pattern, with its strip along the floor line. */
function surfaceStyle({ tile, edge }: Surface, edgeAt: "top" | "bottom") {
  const layers = edge ? [edge, tile] : [tile];
  const size = ({ width, height }: Pattern) =>
    `calc(var(--room-cell) * ${width}) calc(var(--room-cell) * ${height})`;
  return {
    backgroundImage: layers.map(patternUrl).join(", "),
    backgroundSize: layers.map(size).join(", "),
    backgroundRepeat: edge ? "repeat-x, repeat" : "repeat",
    backgroundPosition: edge ? `left ${edgeAt}, left top` : "left top",
  } satisfies CSSProperties;
}
/** Pull a place back by as much as its drawing hangs over (the curtains). */
function overhangStyle({ overhang }: PixelArt): CSSProperties | undefined {
  if (!overhang) return undefined;
  const cells = (n: number) => `calc(var(--room-cell) * ${-n})`;
  return { margin: `${cells(overhang.y)} 0 0 ${cells(overhang.x)}` };
}

const surfaceStyles = new Map<LookId, [CSSProperties, CSSProperties]>();
/** Wall and floor backgrounds; none for the starting room (the room's CSS). */
function roomStyles(look: LookId) {
  if (!isRoomLook(look) || look === DEFAULT_LOOK.room) return null;
  let styles = surfaceStyles.get(look);
  if (!styles) {
    const { wall, floor } = ROOMS[look];
    styles = [surfaceStyle(wall, "bottom"), surfaceStyle(floor, "top")];
    surfaceStyles.set(look, styles);
  }
  return styles;
}

/**
 * The room's walls and floor, window, plant and rug, shared by home and the
 * start of a walk. Shows the placed furniture, or `preview` looks while
 * decorating. The starting walls and rug are the room's own CSS.
 */
export function PetRoomArt({
  preview,
  decorating,
}: {
  preview?: Partial<Record<Slot, LookId>>;
  decorating?: RoomDecorating;
}) {
  const placed = useShownPlaced();
  const time = useTimeOfDay();
  const look = (name: Slot) => preview?.[name] ?? lookOf(name, placed);
  const slot = (
    name: Slot,
    className: string,
    art: ReactNode,
    style?: CSSProperties,
  ) => {
    const selected = decorating?.selected === name;
    return (
      <div
        className={className}
        style={style}
        data-selected={selected}
        data-look={look(name)}
      >
        {art}
        {decorating && (
          <button
            type="button"
            className={styles.slotPick}
            aria-label={decorating.label(name)}
            aria-pressed={selected}
            onClick={() => decorating.onSelect(name)}
          />
        )}
        {selected && (
          <span className={styles.slotTag} aria-hidden="true">
            {decorating.tag}
          </span>
        )}
      </div>
    );
  };
  // The whole Christmas set (I-075): snow, blinking lights, a sleigh flying by.
  // Not while decorating, when the room may be only a preview.
  const christmas = !decorating && editionOf(placed) === "christmas";
  const room = roomStyles(look("room"));
  const windowArt = lookArt(look("window"), time);
  const rug = look("rug");
  return (
    <>
      {slot(
        "room",
        styles.walls,
        room && (
          <>
            <div className={styles.wall} style={room[0]} />
            <div className={styles.floor} style={room[1]} />
          </>
        ),
      )}
      {slot(
        "window",
        styles.window,
        <>
          <Pixels art={windowArt} />
          {christmas && <WindowLights />}
        </>,
        overhangStyle(windowArt),
      )}
      {slot("pot", styles.plant, <Pixels art={lookArt(look("pot"), time)} />)}
      {slot(
        "rug",
        styles.rug,
        isRugLook(rug) && rug !== DEFAULT_LOOK.rug && (
          <Pixels art={floorRugArt(rug)} />
        ),
      )}
      {christmas && <ChristmasSky />}
      {/* What Kkami wears is drawn on his canvas; this only marks where to pick it. */}
      {decorating && slot("outfit", styles.outfitSlot, null)}
    </>
  );
}
